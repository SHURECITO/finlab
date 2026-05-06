export const SECTOR_VALUES = {
  TECNOLOGIA: 'tecnologia',
  RETAIL: 'retail',
  ALIMENTOS: 'alimentos',
  SERVICIOS: 'servicios',
  MANUFACTURA: 'manufactura',
  OTRO: 'otro',
} as const;

export type Sector = (typeof SECTOR_VALUES)[keyof typeof SECTOR_VALUES];

export type SimulationStatus = 'VIABLE' | 'CAUTION' | 'NOT_RECOMMENDED';

export interface SimulationInput {
  requiredCapital: number;
  monthlyRevenue: number;
  monthlyOperatingCosts: number;
  sector: Sector;
  projectionHorizon: 1 | 3 | 5;
  expectedGrowthRate: number;
}

export interface YearlyProjection {
  year: number;
  netFlow: number;
  optimistic: number;
  realistic: number;
  pessimistic: number;
}

export interface SimulationResult {
  projectedIRR: number;
  paybackPeriod: number;
  annualNetFlow: number;
  yearlyProjections: YearlyProjection[];
  status: SimulationStatus;
  statusColor: 'green' | 'yellow' | 'red';
}
