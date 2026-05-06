const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export interface SimulationPayload {
  requiredCapital: number;
  monthlyRevenue: number;
  monthlyOperatingCosts: number;
  sector: string;
  projectionHorizon: 1 | 3 | 5;
  expectedGrowthRate: number;
}

export interface SimulationResponse {
  projectedIRR: number;
  paybackPeriod: number;
  annualNetFlow: number;
  yearlyProjections: Array<{
    year: number;
    netFlow: number;
    optimistic: number;
    realistic: number;
    pessimistic: number;
  }>;
  status: 'VIABLE' | 'CAUTION' | 'NOT_RECOMMENDED';
  statusColor: 'green' | 'yellow' | 'red';
}

export async function runSimulation(
  payload: SimulationPayload,
): Promise<SimulationResponse> {
  const response = await fetch(`${API_BASE_URL}/simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Simulation failed: ${response.status}`);
  }

  return response.json();
}
