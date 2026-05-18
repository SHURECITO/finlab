import { Injectable } from '@nestjs/common';
import { Semaforo } from './traffic-light.service';
import { VpnInterpretation } from './npv.service';

export interface InterpretationInput {
  entidadNombre: string;
  cuotaMensual: number;
  plazoMeses: number;
  totalPagado: number;
  totalIntereses: number;
  monto: number;
  ipcAnual: number;
  semaforo: Semaforo;
  vpnInterpretacion: VpnInterpretation;
}

@Injectable()
export class InterpretationService {
  generate(input: InterpretationInput): string {
    const {
      entidadNombre, cuotaMensual, plazoMeses,
      totalPagado, totalIntereses, monto,
      ipcAnual, semaforo, vpnInterpretacion,
    } = input;

    const ratio = Math.round((totalPagado / monto) * 100000) / 1000;
    const ipcPct = (ipcAnual * 100).toFixed(2);

    const semaforoExplanation = this.getSemaforoText(semaforo);
    const vpnExplanation = this.getVpnText(vpnInterpretacion, ipcPct);

    return [
      `Con ${entidadNombre}, pagarás una cuota mensual de ${this.formatCOP(cuotaMensual)} durante ${plazoMeses} meses.`,
      `Al final habrás pagado ${this.formatCOP(totalPagado)} en total, de los cuales ${this.formatCOP(totalIntereses)} son intereses.`,
      `Esto significa que por cada $100.000 que pides prestados, devuelves $${ratio.toFixed(1).replace('.', ',')}.`,
      semaforoExplanation,
      vpnExplanation,
    ].join(' ');
  }

  private getSemaforoText(semaforo: Semaforo): string {
    if (semaforo === 'verde') return 'Esta es una de las mejores opciones disponibles para tu perfil.';
    if (semaforo === 'amarillo') return 'Esta opción es aceptable, aunque existen alternativas con menor costo.';
    return 'Esta opción tiene un costo elevado; te recomendamos comparar otras alternativas antes de decidir.';
  }

  private getVpnText(interpretacion: VpnInterpretation, ipcPct: string): string {
    if (interpretacion === 'favorable') {
      return `Este crédito es favorable considerando la inflación actual de Colombia (${ipcPct}%): el valor real de lo que pagarás es menor al monto que recibes hoy.`;
    }
    if (interpretacion === 'neutral') {
      return 'Este crédito es neutro frente a la inflación.';
    }
    return `Este crédito tiene un costo real superior a la inflación; conviene revisar otras opciones.`;
  }

  /**
   * Formats a number as Colombian peso string: $1.234.567
   */
  private formatCOP(value: number): string {
    const rounded = Math.round(value);
    return '$' + rounded.toLocaleString('es-CO').replace(/,/g, '.');
  }
}
