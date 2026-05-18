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
    applyUrl?: string;
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

export interface SimulationSummary {
  id: string;
  monto: number;
  plazoMeses: number;
  mejorOpcion: string;
  createdAt: string;
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

export async function getUserSimulations(): Promise<SimulationSummary[]> {
  const res = await fetch(`${API_BASE_URL}/credit/simulations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load simulations: ${res.status}`);
  const data = await res.json() as { simulations: SimulationSummary[] };
  return data.simulations;
}

export function getExcelDownloadUrl(simulationId: string): string {
  return `${API_BASE_URL}/credit/export/${simulationId}/xlsx`;
}

export function getPdfDownloadUrl(simulationId: string): string {
  return `${API_BASE_URL}/credit/export/${simulationId}/pdf`;
}

// Alias so other functions can reference the simulation response type
export type SimulationResponse = SimulationApiResponse;

// ---- Task 9: PDF download ----

export async function downloadSimulationPdf(
  simulationId: string,
  type: 'summary' | 'detailed',
  entityCode?: string,
): Promise<void> {
  const { getToken } = await import('@/lib/auth');
  const token = getToken();
  if (!token) throw new Error('No autenticado');

  const params = new URLSearchParams({ type });
  if (entityCode) params.set('entity', entityCode);

  const res = await fetch(
    `${API_BASE_URL}/credit/export/${simulationId}/pdf?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) throw new Error(`PDF error ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  a.download = match?.[1] ?? `finlab-simulacion.pdf`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Task 10: Get simulation by ID ----

export async function getSimulationById(id: string): Promise<SimulationApiResponse & { _id: string }> {
  const { getToken } = await import('@/lib/auth');
  const token = getToken();
  if (!token) throw new Error('No autenticado');

  const res = await fetch(`${API_BASE_URL}/credit/simulations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Error ${res.status}`);
  const doc = await res.json() as { _id: string; result: SimulationApiResponse };
  return { ...doc.result, _id: doc._id };
}

// ---- Task 11: Delete simulation ----

export async function deleteSimulation(id: string): Promise<void> {
  const { getToken } = await import('@/lib/auth');
  const token = getToken();
  if (!token) throw new Error('No autenticado');

  const res = await fetch(`${API_BASE_URL}/credit/simulations/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

// ---- Task 12: Financing alternatives ----

export interface FinancingAlternative {
  _id: string;
  code: string;
  name: string;
  category: 'capital_semilla' | 'crowdfunding' | 'equity';
  descripcion: string;
  costoDescripcion: string;
  montoMinimo: number;
  montoMaximo: number;
  plazoEjecucionMeses?: number;
  requisitos: string[];
  ventajas: string[];
  desventajas: string[];
  applyUrl: string;
  logoUrl: string;
  sourceUrl: string;
}

export async function getFinancingAlternatives(): Promise<FinancingAlternative[]> {
  const { getToken } = await import('@/lib/auth');
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_BASE_URL}/financing-alternatives`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json() as Promise<FinancingAlternative[]>;
}
