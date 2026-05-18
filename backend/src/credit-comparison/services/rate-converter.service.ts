import { Injectable } from '@nestjs/common';

@Injectable()
export class RateConverterService {
  /**
   * Converts Annual Effective Rate (EA) to monthly equivalent rate.
   * Formula: tasa_mensual = (1 + tasa_EA)^(30/360) - 1
   */
  eaToMonthly(tasaEA: number): number {
    return Math.pow(1 + tasaEA, 30 / 360) - 1;
  }

  /**
   * Converts NAMV (Nominal Anual Mes Vencido) to monthly rate.
   * Formula: tasa_mensual = tasa_NAMV / 12
   */
  namvToMonthly(tasaNAMV: number): number {
    return tasaNAMV / 12;
  }

  /**
   * Converts based on the tasaType field from the entity product.
   */
  toMonthly(tasa: number, tasaType: 'EA' | 'NAMV'): number {
    if (tasaType === 'EA') return this.eaToMonthly(tasa);
    return this.namvToMonthly(tasa);
  }
}
