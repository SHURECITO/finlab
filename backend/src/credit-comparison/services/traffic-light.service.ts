import { Injectable } from '@nestjs/common';

export type Semaforo = 'verde' | 'amarillo' | 'rojo';

export interface TrafficLightInput {
  vpn: number;
  tasaEA: number;
  monto: number;
  medianaEligible: number; // median tasaEA of all eligible entities
}

@Injectable()
export class TrafficLightService {
  /**
   * Semáforo logic:
   * 🟢 Verde:    VPN > 0  AND tasaEA below median
   * 🟡 Amarillo: VPN > 0  AND tasaEA above median,
   *              OR VPN slightly negative (within 10% of monto)
   * 🔴 Rojo:     VPN significantly negative (worse than -10% of monto)
   */
  evaluate(input: TrafficLightInput): Semaforo {
    const { vpn, tasaEA, monto, medianaEligible } = input;
    const threshold = monto * 0.10;

    if (vpn > 0 && tasaEA <= medianaEligible) return 'verde';
    if (vpn > 0 && tasaEA > medianaEligible) return 'amarillo';
    if (vpn >= -threshold) return 'amarillo';
    return 'rojo';
  }

  /**
   * Computes the median tasaEA from a list of eligible entity rates.
   */
  computeMedian(tasasEA: number[]): number {
    if (tasasEA.length === 0) return 0;
    const sorted = [...tasasEA].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }
}
