import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FinancialEntity, FinancialEntityDocument } from './schemas/financial-entity.schema';
import { ReferenceRate, ReferenceRateDocument } from './schemas/reference-rate.schema';
import { SavedSimulation, SavedSimulationDocument } from './schemas/saved-simulation.schema';
import { RateConverterService } from './services/rate-converter.service';
import { AmortizationService } from './services/amortization.service';
import { NpvService } from './services/npv.service';
import { TrafficLightService } from './services/traffic-light.service';
import { InterpretationService } from './services/interpretation.service';
import { SimulateCreditDto } from './dto/simulate-credit.dto';
import {
  SimulationResponse,
  CreditResult,
  PlazoComparison,
  TablasComparativas,
} from './interfaces/credit-types';

@Injectable()
export class CreditComparisonService {
  constructor(
    @InjectModel(FinancialEntity.name)
    private readonly entityModel: Model<FinancialEntityDocument>,
    @InjectModel(ReferenceRate.name)
    private readonly rateModel: Model<ReferenceRateDocument>,
    @InjectModel(SavedSimulation.name)
    private readonly savedSimModel: Model<SavedSimulationDocument>,
    private readonly rateConverter: RateConverterService,
    private readonly amortization: AmortizationService,
    private readonly npv: NpvService,
    private readonly trafficLight: TrafficLightService,
    private readonly interpretation: InterpretationService,
  ) {}

  async simulate(dto: SimulateCreditDto, userId?: string): Promise<SimulationResponse> {
    const { monto, plazoMeses } = dto;

    const ipcRate = await this.rateModel.findOne({ indicator: 'IPC_ANUAL' }).exec();
    const ipcAnual = ipcRate?.value ?? 0.0568; // fallback to seeded value

    const entities = await this.entityModel.find({ stale: false }).exec();

    const allTasas: number[] = [];
    const resultados: CreditResult[] = [];

    for (const entity of entities) {
      for (const product of entity.products) {
        const eligibility = this.checkEligibility(monto, plazoMeses, product);

        if (!eligibility.eligible) {
          resultados.push(this.buildIneligibleResult(entity, product, eligibility.razon));
          continue;
        }

        const tasaType = product.tasaType as 'EA' | 'NAMV';
        const tasaMensual = this.rateConverter.toMonthly(product.tasaEA, tasaType);
        const amortResult = this.amortization.compute(monto, product.tasaEA, plazoMeses, tasaType);
        const npvResult = this.npv.calculate(monto, amortResult.cuotaMensual, plazoMeses, ipcAnual);

        allTasas.push(product.tasaEA);

        resultados.push({
          entidad: {
            code: entity.code,
            name: entity.name,
            type: entity.type as 'banco' | 'fintech',
            logoUrl: entity.logoUrl,
            applyUrl: product.applyUrl ?? '',
          },
          elegible: true,
          tasaEA: product.tasaEA,
          tasaMensual,
          cuotaMensual: amortResult.cuotaMensual,
          totalIntereses: amortResult.totalIntereses,
          totalPagado: amortResult.totalPagado,
          vpn: npvResult.vpn,
          semaforo: 'verde', // placeholder — updated after median is computed
          tablaAmortizacion: amortResult.tabla,
          tablasComparativas: this.buildComparativas(monto, product.tasaEA, tasaType, plazoMeses),
          interpretacion: '', // placeholder — updated after semaforo
          stale: entity.stale,
        });
      }
    }

    // Compute median and assign semaforo + interpretacion
    const mediana = this.trafficLight.computeMedian(allTasas);
    const tasaDescuentoMensual = this.rateConverter.eaToMonthly(ipcAnual);

    for (const r of resultados) {
      if (!r.elegible) continue;
      r.semaforo = this.trafficLight.evaluate({
        vpn: r.vpn,
        tasaEA: r.tasaEA,
        monto,
        medianaEligible: mediana,
      });
      r.interpretacion = this.interpretation.generate({
        entidadNombre: r.entidad.name,
        cuotaMensual: r.cuotaMensual,
        plazoMeses,
        totalPagado: r.totalPagado,
        totalIntereses: r.totalIntereses,
        monto,
        ipcAnual,
        semaforo: r.semaforo,
        vpnInterpretacion: this.npv.calculate(monto, r.cuotaMensual, plazoMeses, ipcAnual).interpretacion,
      });
    }

    const eligibleResults = resultados.filter((r) => r.elegible);
    const recomendacion = this.buildRecomendacion(eligibleResults);

    const baseResponse: SimulationResponse = {
      simulationId: new Types.ObjectId().toString(),
      monto,
      plazoMeses,
      tasaDescuentoMensual,
      ipcAnualUsado: ipcAnual,
      fechaCalculo: new Date().toLocaleDateString('es-CO'),
      resultados,
      recomendacion,
    };

    if (userId) {
      const saved = await this.savedSimModel.create({
        userId: new Types.ObjectId(userId),
        monto,
        plazoMeses,
        proposito: dto.proposito ?? 'libre_inversion',
        result: baseResponse as unknown as Record<string, unknown>,
      });
      baseResponse.simulationId = (saved._id as Types.ObjectId).toString();
    }

    return baseResponse;
  }

  async getEntities(): Promise<FinancialEntityDocument[]> {
    return this.entityModel.find().exec();
  }

  async getUserSimulations(userId: string): Promise<{
    simulations: Array<{ id: string; monto: number; plazoMeses: number; mejorOpcion: string; createdAt: Date }>;
  }> {
    const docs = await this.savedSimModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    return {
      simulations: docs.map((doc) => {
        const result = doc.result as { recomendacion?: { mejorOpcion?: string } };
        const docWithTs = doc as typeof doc & { createdAt: Date };
        return {
          id: (doc._id as Types.ObjectId).toString(),
          monto: doc.monto,
          plazoMeses: doc.plazoMeses,
          mejorOpcion: result?.recomendacion?.mejorOpcion ?? '—',
          createdAt: docWithTs.createdAt,
        };
      }),
    };
  }

  async getSimulationById(id: string, userId: string): Promise<SavedSimulationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Simulación ${id} no encontrada`);
    }
    const doc = await this.savedSimModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Simulación ${id} no encontrada`);
    if (doc.userId.toString() !== userId) {
      throw new ForbiddenException('No tienes acceso a esta simulación');
    }
    return doc;
  }

  async deleteSimulation(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Simulación ${id} no encontrada`);
    }
    const doc = await this.savedSimModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Simulación ${id} no encontrada`);
    if (doc.userId.toString() !== userId) {
      throw new ForbiddenException('No tienes acceso a esta simulación');
    }
    await this.savedSimModel.findByIdAndDelete(id).exec();
  }

  async saveSimulation(
    userId: string,
    dto: SimulateCreditDto,
    nombre?: string,
  ): Promise<SavedSimulationDocument> {
    const result = await this.simulate(dto);
    const doc = new this.savedSimModel({
      userId: new Types.ObjectId(userId),
      monto: dto.monto,
      plazoMeses: dto.plazoMeses,
      proposito: dto.proposito,
      result,
      nombre,
    });
    return doc.save();
  }

  // ---- Private helpers ----

  private checkEligibility(
    monto: number,
    plazoMeses: number,
    product: {
      montoMinimo: number;
      montoMaximo: number;
      plazoMinMeses: number;
      plazoMaxMeses: number;
    },
  ): { eligible: boolean; razon: string } {
    if (monto < product.montoMinimo) {
      return {
        eligible: false,
        razon: `El monto solicitado (${this.formatCOP(monto)}) es menor al mínimo requerido de ${this.formatCOP(product.montoMinimo)}.`,
      };
    }
    if (monto > product.montoMaximo) {
      return {
        eligible: false,
        razon: `El monto solicitado (${this.formatCOP(monto)}) supera el máximo de ${this.formatCOP(product.montoMaximo)}.`,
      };
    }
    if (plazoMeses < product.plazoMinMeses) {
      return {
        eligible: false,
        razon: `El plazo solicitado (${plazoMeses} meses) es menor al mínimo de ${product.plazoMinMeses} meses.`,
      };
    }
    if (plazoMeses > product.plazoMaxMeses) {
      return {
        eligible: false,
        razon: `El plazo solicitado (${plazoMeses} meses) supera el máximo de ${product.plazoMaxMeses} meses.`,
      };
    }
    return { eligible: true, razon: '' };
  }

  private buildIneligibleResult(
    entity: FinancialEntityDocument,
    product: { tasaEA: number; applyUrl?: string },
    razon: string,
  ): CreditResult {
    return {
      entidad: {
        code: entity.code,
        name: entity.name,
        type: entity.type as 'banco' | 'fintech',
        logoUrl: entity.logoUrl,
        applyUrl: product.applyUrl ?? '',
      },
      elegible: false,
      razonNoElegible: razon,
      tasaEA: product.tasaEA,
      tasaMensual: 0,
      cuotaMensual: 0,
      totalIntereses: 0,
      totalPagado: 0,
      vpn: 0,
      semaforo: 'rojo',
      tablaAmortizacion: [],
      tablasComparativas: {
        plazo12: { cuota: 0, totalIntereses: 0, totalPagado: 0 },
        plazo36: { cuota: 0, totalIntereses: 0, totalPagado: 0 },
        plazo60: { cuota: 0, totalIntereses: 0, totalPagado: 0 },
        plazoUsuario: { cuota: 0, totalIntereses: 0, totalPagado: 0 },
      },
      interpretacion: razon,
      stale: entity.stale,
    };
  }

  private buildComparativas(
    monto: number,
    tasaEA: number,
    tasaType: 'EA' | 'NAMV',
    plazoUsuario: number,
  ): TablasComparativas {
    const compute = (plazo: number): PlazoComparison => {
      const r = this.amortization.compute(monto, tasaEA, plazo, tasaType);
      return { cuota: r.cuotaMensual, totalIntereses: r.totalIntereses, totalPagado: r.totalPagado };
    };
    return {
      plazo12: compute(12),
      plazo36: compute(36),
      plazo60: compute(60),
      plazoUsuario: compute(plazoUsuario),
    };
  }

  private buildRecomendacion(
    eligible: CreditResult[],
  ): { mejorOpcion: string; razon: string } {
    if (eligible.length === 0) {
      return {
        mejorOpcion: 'Ninguna',
        razon: 'No hay entidades elegibles para el monto y plazo solicitados.',
      };
    }

    const verdes = eligible.filter((r) => r.semaforo === 'verde');
    const pool = verdes.length > 0 ? verdes : eligible;
    const best = pool.reduce((a, b) => (a.vpn > b.vpn ? a : b));

    return {
      mejorOpcion: best.entidad.name,
      razon:
        verdes.length > 0
          ? `${best.entidad.name} ofrece la mejor relación costo-beneficio considerando la inflación actual.`
          : `Entre las opciones disponibles, ${best.entidad.name} tiene el menor costo real.`,
    };
  }

  private formatCOP(value: number): string {
    return '$' + Math.round(value).toLocaleString('es-CO').replace(/,/g, '.');
  }
}
