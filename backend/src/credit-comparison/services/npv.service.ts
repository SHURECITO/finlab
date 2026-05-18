import { Injectable } from '@nestjs/common';
import { RateConverterService } from './rate-converter.service';

export type VpnInterpretation = 'favorable' | 'neutral' | 'desfavorable';

export interface NpvResult {
  vpn: number;
  interpretacion: VpnInterpretation;
}

@Injectable()
export class NpvService {
  constructor(private readonly rateConverter: RateConverterService) {}

  /**
   * Calculates Net Present Value (VPN) of a loan for the borrower.
   * VPN = -monto + Σ(cuota_k / (1 + d)^k) for k = 1..n
   * where d = monthly discount rate derived from IPC anual.
   *
   * VPN > 0 means the loan is favorable vs inflation (real cost < 0).
   * VPN < 0 means the real cost exceeds inflation.
   */
  calculate(
    monto: number,
    cuotaMensual: number,
    plazoMeses: number,
    ipcAnual: number,
  ): NpvResult {
    const d = this.rateConverter.eaToMonthly(ipcAnual);
    let sumaPV = 0;

    for (let k = 1; k <= plazoMeses; k++) {
      sumaPV += cuotaMensual / Math.pow(1 + d, k);
    }

    const vpn = -monto + sumaPV;
    const interpretacion = this.interpret(vpn, monto);

    return { vpn: Math.round(vpn * 100) / 100, interpretacion };
  }

  private interpret(vpn: number, monto: number): VpnInterpretation {
    const threshold = monto * 0.1;
    if (vpn > 0) return 'favorable';
    if (vpn >= -threshold) return 'neutral';
    return 'desfavorable';
  }
}
