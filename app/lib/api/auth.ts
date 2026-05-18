import { API_BASE_URL, authHeaders } from './helpers';

export interface UserProfile {
  id: string;
  email: string;
  businessName: string;
  sector?: string;
  city?: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserProfile;
}

export async function register(data: {
  email: string;
  password: string;
  businessName: string;
  sector?: string;
  city?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Register failed: ${res.status}`);
  }
  return res.json();
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Login failed: ${res.status}`);
  }
  return res.json();
}

export async function getProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Get profile failed: ${res.status}`);
  return res.json();
}

export async function updateProfile(data: { businessName?: string; sector?: string; city?: string }): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update profile failed: ${res.status}`);
  return res.json();
}
