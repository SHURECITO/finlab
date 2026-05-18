import { Test, TestingModule } from '@nestjs/testing';
import { NpvService } from '../npv.service';
import { RateConverterService } from '../rate-converter.service';

describe('NpvService', () => {
  let service: NpvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NpvService, RateConverterService],
    }).compile();

    service = module.get<NpvService>(NpvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    /**
     * IPC 5.68% annual:
     *   d = (1.0568)^(30/360) - 1 ≈ 0.004614
     *
     * Favorable scenario:
     *   monto = 10,000,000, cuota = 521,368.48, n = 24, ipc = 5.68%
     *   PV of payments > monto because d < i (inflation < loan rate from borrower perspective,
     *   so paying back in "inflated" pesos is relatively cheap — real burden is low)
     *   VPN ≈ +1,819,089 → 'favorable'
     *
     * Desfavorable scenario:
     *   monto = 10,000,000, cuota = 300,000, n = 24, ipc = 60%
     *   Very high discount rate means PV of payments << monto
     *   VPN ≈ -5,423,292 → < -10% of monto → 'desfavorable'
     */

    it('returns favorable when VPN > 0', () => {
      // Low IPC (5.68%), loan rate higher → PV(payments) > monto
      const result = service.calculate(10_000_000, 521368.48, 24, 0.0568);
      expect(result.vpn).toBeGreaterThan(0);
      expect(result.interpretacion).toBe('favorable');
    });

    it('returns desfavorable when VPN < -10% of monto', () => {
      // Very high IPC (60%) makes PV of payments much less than monto
      // vpn ≈ -5,423,292 which is well below -1,000,000 (10% of 10M)
      const result = service.calculate(10_000_000, 300_000, 24, 0.6);
      expect(result.vpn).toBeLessThan(-10_000_000 * 0.1);
      expect(result.interpretacion).toBe('desfavorable');
    });

    it('returns neutral when VPN is between -10% and 0 of monto', () => {
      // Craft a scenario where -threshold <= vpn <= 0
      // With moderate IPC and moderate cuota, vpn should be slightly negative
      // We can construct this by finding the right cuota that yields slightly negative vpn
      // Use IPC 5.68%, n=12, and a cuota slightly below break-even
      // Break-even cuota: monto / sum(1/(1+d)^k)
      const monto = 10_000_000;
      const ipc = 0.0568;
      const d = Math.pow(1 + ipc, 30 / 360) - 1;
      const n = 12;
      let annuityFactor = 0;
      for (let k = 1; k <= n; k++) {
        annuityFactor += 1 / Math.pow(1 + d, k);
      }
      // Break-even cuota makes vpn = 0 exactly
      const breakEvenCuota = monto / annuityFactor;
      // Reduce by 5% to get a slightly negative vpn (within neutral range)
      const cuotaNeutral = breakEvenCuota * 0.95;

      const result = service.calculate(monto, cuotaNeutral, n, ipc);
      expect(result.vpn).toBeLessThanOrEqual(0);
      expect(result.vpn).toBeGreaterThanOrEqual(-monto * 0.1);
      expect(result.interpretacion).toBe('neutral');
    });

    it('returns a rounded vpn value (2 decimal places)', () => {
      const result = service.calculate(10_000_000, 521368.48, 24, 0.0568);
      const rounded = Math.round(result.vpn * 100) / 100;
      expect(result.vpn).toBe(rounded);
    });

    it('uses IPC 5.68% to derive monthly discount rate ≈ 0.004614', () => {
      // Verify the discount rate is derived correctly by checking a 1-period case
      // VPN = -monto + cuota / (1 + d)
      // If we set cuota = monto * (1 + d), VPN should be 0
      const ipc = 0.0568;
      const d = Math.pow(1 + ipc, 30 / 360) - 1; // ≈ 0.004614
      expect(d).toBeCloseTo(0.004614, 4);

      const monto = 1_000_000;
      const cuota = monto * (1 + d); // exactly break-even for n=1
      const result = service.calculate(monto, cuota, 1, ipc);
      expect(result.vpn).toBeCloseTo(0, 0);
    });
  });
});
