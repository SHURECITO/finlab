import { Injectable } from '@nestjs/common';

export interface CashFlowInput {
  activos: number;
  ingresosMensuales: number;
  gastosMensuales: number;
  montoCredito: number;
  inflacionAnual: number;
}

export interface YearlyCashFlow {
  year: number;
  capitalDeTrabajo: number;
  flujoCajaOperativo: number;
  flujoCajaInversion: number;
  flujoCajaProyecto: number;
}

export interface CashFlowProjection {
  years: YearlyCashFlow[];
  inflacionAnualUsada: number;
}

@Injectable()
export class CashFlowProjectionService {
  /**
   * Projects 5 years of cash flows.
   * FCO = (ingresos - gastos) * 12, compounded by inflation each year.
   * FCI = -montoCredito in year 1, 0 thereafter.
   * FCP = FCO + FCI.
   * Capital de trabajo starts at activos and accumulates FCP each year.
   */
  compute(input: CashFlowInput): CashFlowProjection {
    const years: YearlyCashFlow[] = [];
    let capitalDeTrabajo = input.activos;

    for (let year = 1; year <= 5; year++) {
      const inflationFactor = Math.pow(1 + input.inflacionAnual, year - 1);
      const ingresosAnuales = input.ingresosMensuales * 12 * inflationFactor;
      const gastosAnuales = input.gastosMensuales * 12 * inflationFactor;
      const fco = ingresosAnuales - gastosAnuales;
      const fci = year === 1 ? -input.montoCredito : 0;
      const fcp = fco + fci;

      capitalDeTrabajo += fcp;

      years.push({
        year,
        capitalDeTrabajo: Math.round(capitalDeTrabajo),
        flujoCajaOperativo: Math.round(fco),
        flujoCajaInversion: Math.round(fci),
        flujoCajaProyecto: Math.round(fcp),
      });
    }

    return { years, inflacionAnualUsada: input.inflacionAnual };
  }
}
