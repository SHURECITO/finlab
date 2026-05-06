import { IsEnum, IsIn, IsNumber, Max, Min } from 'class-validator';
import type { Sector } from '../types/simulation.types';
import { SECTOR_VALUES } from '../types/simulation.types';

const MIN_POSITIVE = 1;
const MIN_GROWTH_RATE = 1;
const MAX_GROWTH_RATE = 100;
const MIN_HORIZON = 1;
const MAX_HORIZON = 5;

export class CreateSimulationDto {
  @IsNumber()
  @Min(MIN_POSITIVE)
  requiredCapital: number;

  @IsNumber()
  @Min(MIN_POSITIVE)
  monthlyRevenue: number;

  @IsNumber()
  @Min(MIN_POSITIVE)
  monthlyOperatingCosts: number;

  @IsEnum(SECTOR_VALUES)
  sector: Sector;

  @IsNumber()
  @Min(MIN_HORIZON)
  @Max(MAX_HORIZON)
  @IsIn([1, 3, 5])
  projectionHorizon: 1 | 3 | 5;

  @IsNumber()
  @Min(MIN_GROWTH_RATE)
  @Max(MAX_GROWTH_RATE)
  expectedGrowthRate: number;
}
