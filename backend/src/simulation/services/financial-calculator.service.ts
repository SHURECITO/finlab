import { Injectable } from '@nestjs/common';
import {
  SimulationInput,
  SimulationResult,
  SimulationStatus,
} from '../types/simulation.types';

const OPTIMISTIC_MULTIPLIER = 1.3;
const REALISTIC_MULTIPLIER = 1.0;
const PESSIMISTIC_MULTIPLIER = 0.7;
const MONTHS_PER_YEAR = 12;
const IRR_VIABLE_THRESHOLD = 20;
const IRR_CAUTION_THRESHOLD = 10;
const PERCENT_MULTIPLIER = 100;

interface StatusMeta {
  status: SimulationStatus;
  statusColor: SimulationResult['statusColor'];
}

@Injectable()
export class FinancialCalculatorService {
  calculate(input: SimulationInput): SimulationResult {
    const annualRevenue = input.monthlyRevenue * MONTHS_PER_YEAR;
    const annualCosts = input.monthlyOperatingCosts * MONTHS_PER_YEAR;
    const annualNetFlow = annualRevenue - annualCosts;
    const projectedIRR =
      (annualNetFlow / input.requiredCapital) * PERCENT_MULTIPLIER;
    const paybackPeriod = input.requiredCapital / annualNetFlow;

    const yearlyProjections = Array.from(
      { length: input.projectionHorizon },
      (_, index) => {
        const year = index + 1;
        const growthFactor = Math.pow(
          1 + input.expectedGrowthRate / PERCENT_MULTIPLIER,
          year,
        );
        const netFlow = annualNetFlow * growthFactor;

        return {
          year,
          netFlow,
          optimistic: netFlow * OPTIMISTIC_MULTIPLIER,
          realistic: netFlow * REALISTIC_MULTIPLIER,
          pessimistic: netFlow * PESSIMISTIC_MULTIPLIER,
        };
      },
    );

    const { status, statusColor } = this.getStatus(projectedIRR);

    return {
      projectedIRR,
      paybackPeriod,
      annualNetFlow,
      yearlyProjections,
      status,
      statusColor,
    };
  }

  private getStatus(projectedIRR: number): StatusMeta {
    if (projectedIRR >= IRR_VIABLE_THRESHOLD) {
      return { status: 'VIABLE', statusColor: 'green' };
    }

    if (projectedIRR >= IRR_CAUTION_THRESHOLD) {
      return { status: 'CAUTION', statusColor: 'yellow' };
    }

    return { status: 'NOT_RECOMMENDED', statusColor: 'red' };
  }
}
