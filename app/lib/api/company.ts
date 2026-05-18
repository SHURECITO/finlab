import { API_BASE_URL, authHeaders } from './helpers';

export interface Company {
  _id: string;
  name: string;
  description: string;
  sector: string;
  city: string;
  stage: string;
  foundedYear: number;
  website?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface PublicCompanySummary {
  _id: string;
  name: string;
  description: string;
  sector: string;
  city: string;
  stage: string;
  foundedYear: number;
  latestSimulation?: {
    _id: string;
    result: {
      projectedIRR: number;
      paybackPeriod: number;
      status: string;
      statusColor: string;
    };
    createdAt: string;
  };
}

export interface SimulationHistoryItem {
  _id: string;
  input: Record<string, unknown>;
  result: {
    projectedIRR: number;
    paybackPeriod: number;
    annualNetFlow: number;
    status: string;
    statusColor: string;
  };
  createdAt: string;
}

export async function createCompany(data: Omit<Company, '_id' | 'createdAt'>): Promise<Company> {
  const res = await fetch(`${API_BASE_URL}/companies`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create company failed: ${res.status}`);
  return res.json();
}

export async function getMyCompanies(): Promise<Company[]> {
  const res = await fetch(`${API_BASE_URL}/companies/my`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Get companies failed: ${res.status}`);
  return res.json();
}

export async function getPublicCompanies(): Promise<PublicCompanySummary[]> {
  const res = await fetch(`${API_BASE_URL}/companies/public`);
  if (!res.ok) throw new Error(`Get public companies failed: ${res.status}`);
  return res.json();
}

export async function getCompany(id: string): Promise<Company> {
  const res = await fetch(`${API_BASE_URL}/companies/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Get company failed: ${res.status}`);
  return res.json();
}

export async function updateCompany(id: string, data: Partial<Omit<Company, '_id' | 'createdAt'>>): Promise<Company> {
  const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update company failed: ${res.status}`);
  return res.json();
}

export async function getMySimulations(companyId?: string): Promise<SimulationHistoryItem[]> {
  const url = companyId
    ? `${API_BASE_URL}/simulations/my?companyId=${companyId}`
    : `${API_BASE_URL}/simulations/my`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Get simulations failed: ${res.status}`);
  return res.json();
}
