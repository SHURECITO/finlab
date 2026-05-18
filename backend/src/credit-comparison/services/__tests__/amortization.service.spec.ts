import { Test, TestingModule } from '@nestjs/testing';
import { AmortizationService } from '../amortization.service';
import { RateConverterService } from '../rate-converter.service';

describe('AmortizationService', () => {
  let service: AmortizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmortizationService, RateConverterService],
    }).compile();

    service = module.get<AmortizationService>(AmortizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('compute - known fixture: $10,000,000 COP at 25% EA for 24 months', () => {
    /**
     * Fixture computation:
     *   i = (1.25)^(30/360) - 1 ≈ 0.018769265121506118
     *   factor = (1 + i)^24 = (1.25)^2 = 1.5625
     *   cuota = 10,000,000 * (i * factor) / (factor - 1)
     *         ≈ 521,368.48 COP
     *   totalPagado = 521,368.48 * 24 ≈ 12,512,843.41
     *   totalIntereses = totalPagado - 10,000,000 ≈ 2,512,843.41
     */
    const MONTO = 10_000_000;
    const TASA_EA = 0.25;
    const PLAZO = 24;

    let result: ReturnType<AmortizationService['compute']>;

    beforeEach(() => {
      result = service.compute(MONTO, TASA_EA, PLAZO);
    });

    it('returns 24 rows in the amortization table', () => {
      expect(result.tabla.length).toBe(24);
    });

    it('first row saldoInicial equals the full loan amount', () => {
      expect(result.tabla[0].saldoInicial).toBe(10_000_000);
    });

    it('last row saldoFinal equals 0', () => {
      expect(result.tabla[23].saldoFinal).toBe(0);
    });

    it('cuotaMensual is approximately 521,368.48', () => {
      expect(result.cuotaMensual).toBeCloseTo(521368.48, 0);
    });

    it('totalPagado equals cuotaMensual * 24', () => {
      // Due to rounding, allow small tolerance
      expect(result.totalPagado).toBeCloseTo(result.cuotaMensual * 24, 0);
    });

    it('totalIntereses is positive', () => {
      expect(result.totalIntereses).toBeGreaterThan(0);
    });

    it('each row cuota matches cuotaMensual', () => {
      result.tabla.forEach((row) => {
        expect(row.cuota).toBe(result.cuotaMensual);
      });
    });

    it('each row: saldoFinal = saldoInicial - abonoCapital', () => {
      result.tabla.slice(0, -1).forEach((row) => {
        expect(row.saldoFinal).toBeCloseTo(
          row.saldoInicial - row.abonoCapital,
          0,
        );
      });
    });

    it('each row: cuota = interes + abonoCapital', () => {
      result.tabla.forEach((row) => {
        expect(row.cuota).toBeCloseTo(row.interes + row.abonoCapital, 0);
      });
    });
  });

  describe('compute - NAMV rate type', () => {
    it('accepts NAMV rate and computes correctly', () => {
      // 12% NAMV = 1% monthly
      const result = service.compute(1_000_000, 0.12, 12, 'NAMV');
      expect(result.tabla.length).toBe(12);
      expect(result.tabla[0].saldoInicial).toBe(1_000_000);
      expect(result.tabla[11].saldoFinal).toBe(0);
      expect(result.cuotaMensual).toBeGreaterThan(0);
    });
  });
});
