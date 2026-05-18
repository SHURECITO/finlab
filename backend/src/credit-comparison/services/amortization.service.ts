import { Injectable } from '@nestjs/common';
import { RateConverterService } from './rate-converter.service';

export interface AmortizationRow {
  mes: number;
  saldoInicial: number;
  cuota: number;
  interes: number;
  abonoCapital: number;
  saldoFinal: number;
}

export interface AmortizationResult {
  cuotaMensual: number;
  totalIntereses: number;
  totalPagado: number;
  tabla: AmortizationRow[];
}

@Injectable()
export class AmortizationService {
  constructor(private readonly rateConverter: RateConverterService) {}

  /**
   * Computes French system (cuota fija) amortization table.
   * cuota = monto * (i * (1 + i)^n) / ((1 + i)^n - 1)
   */
  compute(
    monto: number,
    tasaEA: number,
    plazoMeses: number,
    tasaType: 'EA' | 'NAMV' = 'EA',
  ): AmortizationResult {
    const i = this.rateConverter.toMonthly(tasaEA, tasaType);
    const n = plazoMeses;
    const factor = Math.pow(1 + i, n);
    const cuotaMensual = (monto * (i * factor)) / (factor - 1);

    const tabla: AmortizationRow[] = [];
    let saldo = monto;

    for (let mes = 1; mes <= n; mes++) {
      const saldoInicial = saldo;
      const interes = saldo * i;
      const abonoCapital = cuotaMensual - interes;
      saldo = saldo - abonoCapital;
      // Clamp saldo to 0 on last row to avoid floating point residuals
      const saldoFinal = mes === n ? 0 : saldo;

      tabla.push({
        mes,
        saldoInicial: this.round(saldoInicial),
        cuota: this.round(cuotaMensual),
        interes: this.round(interes),
        abonoCapital: this.round(abonoCapital),
        saldoFinal: this.round(saldoFinal),
      });
    }

    const totalPagado = cuotaMensual * n;
    const totalIntereses = totalPagado - monto;

    return {
      cuotaMensual: this.round(cuotaMensual),
      totalIntereses: this.round(totalIntereses),
      totalPagado: this.round(totalPagado),
      tabla,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
