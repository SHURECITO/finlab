import { API_BASE_URL, authHeaders } from './helpers';

// ---- Types ----

export interface AmortizationRow {
  mes: number;
  saldoInicial: number;
  cuota: number;
  interes: number;
  abonoCapital: number;
  saldoFinal: number;
}

export interface PlazoComparison {
  cuota: number;
  totalIntereses: number;
  totalPagado: number;
}

export interface TablasComparativas {
  plazo12: PlazoComparison;
  plazo36: PlazoComparison;
  plazo60: PlazoComparison;
  plazoUsuario: PlazoComparison;
}

export interface CreditResultItem {
  entidad: {
    code: string;
    name: string;
    type: 'banco' | 'fintech';
    logoUrl: string;
  };
  elegible: boolean;
  razonNoElegible?: string;
  tasaEA: number;
  tasaMensual: number;
  cuotaMensual: number;
  totalIntereses: number;
  totalPagado: number;
  vpn: number;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  tablaAmortizacion: AmortizationRow[];
  tablasComparativas: TablasComparativas;
  interpretacion: string;
  stale?: boolean;
}

export interface SimulationRequest {
  monto: number;
  plazoMeses: number;
  proposito: 'libre_inversion';
}

export interface SimulationApiResponse {
  simulationId: string;
  monto: number;
  plazoMeses: number;
  tasaDescuentoMensual: number;
  ipcAnualUsado: number;
  fechaCalculo: string;
  resultados: CreditResultItem[];
  recomendacion: {
    mejorOpcion: string;
    razon: string;
  };
}

export interface FinancialEntityItem {
  _id: string;
  code: string;
  name: string;
  type: 'banco' | 'fintech';
  logoUrl: string;
  stale: boolean;
  updatedAt: string;
}

// ---- API functions ----

export async function simulateCredit(req: SimulationRequest): Promise<SimulationApiResponse> {
  const res = await fetch(`${API_BASE_URL}/credit/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `Simulation failed: ${res.status}`);
  }
  return res.json() as Promise<SimulationApiResponse>;
}

export async function getCreditEntities(): Promise<FinancialEntityItem[]> {
  const res = await fetch(`${API_BASE_URL}/credit/entities`);
  if (!res.ok) throw new Error(`Failed to load entities: ${res.status}`);
  return res.json() as Promise<FinancialEntityItem[]>;
}

export async function saveSimulation(
  req: SimulationRequest & { nombre?: string },
): Promise<{ _id: string }> {
  const res = await fetch(`${API_BASE_URL}/credit/simulations/save`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return res.json() as Promise<{ _id: string }>;
}

export async function getUserSimulations(): Promise<Array<{
  _id: string;
  monto: number;
  plazoMeses: number;
  proposito: string;
  nombre: string;
  createdAt: string;
}>> {
  const res = await fetch(`${API_BASE_URL}/credit/simulations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load simulations: ${res.status}`);
  return res.json();
}

export function getExcelDownloadUrl(simulationId: string): string {
  return `${API_BASE_URL}/credit/export/${simulationId}/xlsx`;
}

export function getPdfDownloadUrl(simulationId: string): string {
  return `${API_BASE_URL}/credit/export/${simulationId}/pdf`;
}
