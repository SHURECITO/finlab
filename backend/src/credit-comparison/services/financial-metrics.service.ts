import { Injectable } from '@nestjs/common';

export interface FinancialMetricsInput {
  flujosCajaProyecto: number[];
  wacc: number;
}

export interface FinancialMetricsOutput {
  vpn: number;
  tir: number;
  wacc: number;
  evaluacion: 'rentable' | 'no_rentable' | 'marginal';
  explicacion: string;
}

@Injectable()
export class FinancialMetricsService {
  /**
   * VPN = sum(FCP_t / (1+WACC)^t) for t=1..n
   * TIR = rate r such that VPN(r) = 0, via Newton-Raphson.
   * Decision: TIR > WACC+2% → rentable, within ±2% → marginal, else no_rentable.
   */
  compute(input: FinancialMetricsInput): FinancialMetricsOutput {
    const vpn = this.npv(input.flujosCajaProyecto, input.wacc);
    const tir = this.irr(input.flujosCajaProyecto);

    const waccPct = (input.wacc * 100).toFixed(1);
    const tirPct = tir !== null ? (tir * 100).toFixed(1) : null;

    let evaluacion: FinancialMetricsOutput['evaluacion'];
    let explicacion: string;

    if (tir === null) {
      evaluacion = 'no_rentable';
      explicacion = `No se pudo calcular una TIR convergente con estos flujos. Esto suele indicar que el proyecto genera pérdidas en la mayoría de los años. Tu WACC sectorial de referencia es ${waccPct}%.`;
    } else if (tir > input.wacc + 0.02) {
      evaluacion = 'rentable';
      explicacion = `Tu TIR (${tirPct}%) supera al WACC de tu sector (${waccPct}%). El proyecto genera valor por encima del costo del capital esperado para empresas similares en tu industria.`;
    } else if (tir < input.wacc - 0.02) {
      evaluacion = 'no_rentable';
      explicacion = `Tu TIR (${tirPct}%) está por debajo del WACC de tu sector (${waccPct}%). El proyecto no compensa el costo del capital. Considera reducir el monto del crédito o revisar tu estructura de costos.`;
    } else {
      evaluacion = 'marginal';
      explicacion = `Tu TIR (${tirPct}%) está cerca del WACC sectorial (${waccPct}%). El proyecto es marginalmente rentable; pequeñas variaciones en ingresos o costos podrían cambiar el resultado. Procede con cautela.`;
    }

    return {
      vpn: Math.round(vpn),
      tir: tir === null ? 0 : parseFloat(tir.toFixed(6)),
      wacc: input.wacc,
      evaluacion,
      explicacion,
    };
  }

  private npv(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t + 1), 0);
  }

  private irr(cashFlows: number[]): number | null {
    const maxIter = 100;
    const tolerance = 1e-7;
    let rate = 0.1;

    for (let i = 0; i < maxIter; i++) {
      let npv = 0;
      let dnpv = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        const factor = Math.pow(1 + rate, t + 1);
        npv += cashFlows[t] / factor;
        dnpv -= (t + 1) * cashFlows[t] / (factor * (1 + rate));
      }
      if (Math.abs(dnpv) < 1e-12) return null;
      const next = rate - npv / dnpv;
      if (Math.abs(next - rate) < tolerance) {
        if (next < -1 || next > 5) return null;
        return next;
      }
      rate = next;
    }
    return null;
  }
}
