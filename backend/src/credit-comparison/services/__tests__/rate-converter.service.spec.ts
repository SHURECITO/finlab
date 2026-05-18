import { Test, TestingModule } from '@nestjs/testing';
import { RateConverterService } from '../rate-converter.service';

describe('RateConverterService', () => {
  let service: RateConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateConverterService],
    }).compile();

    service = module.get<RateConverterService>(RateConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('eaToMonthly', () => {
    it('converts 25% EA to monthly rate with 6 decimal precision', () => {
      const result = service.eaToMonthly(0.25);
      // (1.25)^(30/360) - 1 ≈ 0.018769265121506118
      expect(result).toBeCloseTo(0.018769, 6);
    });

    it('returns 0 for 0% EA', () => {
      expect(service.eaToMonthly(0)).toBe(0);
    });
  });

  describe('namvToMonthly', () => {
    it('converts 12% NAMV to 1% monthly', () => {
      expect(service.namvToMonthly(0.12)).toBe(0.01);
    });

    it('converts 24% NAMV to 2% monthly', () => {
      expect(service.namvToMonthly(0.24)).toBeCloseTo(0.02, 10);
    });
  });

  describe('toMonthly', () => {
    it('delegates to eaToMonthly when tasaType is EA', () => {
      const result = service.toMonthly(0.25, 'EA');
      expect(result).toBeCloseTo(service.eaToMonthly(0.25), 10);
    });

    it('delegates to namvToMonthly when tasaType is NAMV', () => {
      const result = service.toMonthly(0.12, 'NAMV');
      expect(result).toBe(service.namvToMonthly(0.12));
    });
  });
});
