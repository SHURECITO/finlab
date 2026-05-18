'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { getMyCompanies, getMySimulations, Company, SimulationHistoryItem } from '@/lib/api/company';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [simulations, setSimulations] = useState<SimulationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, companiesData, simulationsData] = await Promise.all([
          getProfile(),
          getMyCompanies(),
          getMySimulations(),
        ]);
        setProfile(profileData);
        setCompanies(companiesData);
        setSimulations(simulationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#666', fontSize: '16px' }}>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#ff4444', fontSize: '16px' }}>{error}</p>
      </div>
    );
  }

  const lastSim = simulations[0] ?? null;
  const recentSims = simulations.slice(0, 5);

  function statusBadgeStyle(statusColor: string): React.CSSProperties {
    const bg =
      statusColor === 'green'
        ? 'rgba(0,255,135,.1)'
        : statusColor === 'yellow'
        ? 'rgba(255,184,0,.1)'
        : 'rgba(255,68,68,.1)';
    const color =
      statusColor === 'green'
        ? '#00FF87'
        : statusColor === 'yellow'
        ? '#FFB800'
        : '#FF4444';
    return {
      background: bg,
      color,
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 600,
      display: 'inline-block',
    };
  }

  return (
    <div>
      {/* Welcome header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>
          Hola, {profile?.businessName ?? ''}
        </h1>
        <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
          Aquí tienes un resumen de tu actividad en FinLab.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {/* Total companies */}
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '16px', padding: '24px', flex: 1, minWidth: '160px',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#00FF87' }}>
            {companies.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>Empresas registradas</div>
        </div>

        {/* Total simulations */}
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '16px', padding: '24px', flex: 1, minWidth: '160px',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#00FF87' }}>
            {simulations.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>Simulaciones totales</div>
        </div>

        {/* Last simulation status */}
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '16px', padding: '24px', flex: 1, minWidth: '160px',
        }}>
          {lastSim ? (
            <>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#00FF87' }}>
                {lastSim.result.projectedIRR.toFixed(1)}%
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                Última simulación — <span style={statusBadgeStyle(lastSim.result.statusColor)}>{lastSim.result.status}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#444' }}>—</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>Sin simulaciones aún</div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#aaa', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Acciones rápidas
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/dashboard/companies/new" style={{
            padding: '12px 24px', background: '#00FF87', borderRadius: '10px',
            color: '#000', fontWeight: 600, fontSize: '14px', textDecoration: 'none',
          }}>
            + Nueva empresa
          </Link>
          <Link href="/dashboard/comparador-alternativas" style={{
            padding: '12px 24px', background: 'rgba(0,255,135,.1)', borderRadius: '10px',
            color: '#00FF87', fontWeight: 600, fontSize: '14px', textDecoration: 'none',
            border: '1px solid rgba(0,255,135,.2)',
          }}>
            💳 Comparador de Crédito
          </Link>
        </div>
      </div>

      {/* Recent simulations */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#aaa', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Simulaciones recientes
        </h2>

        {recentSims.length === 0 ? (
          <div style={{
            background: '#111', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#555',
          }}>
            Aún no tienes simulaciones.{' '}
            <Link href="/dashboard/comparador-alternativas" style={{ color: '#00FF87', textDecoration: 'none' }}>Crea tu primera simulación</Link>.
          </div>
        ) : (
          <div style={{
            background: '#111', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: '16px', overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 140px 80px',
              padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,.06)',
            }}>
              {['Fecha', 'TIR', 'Estado', ''].map(col => (
                <span key={col} style={{ fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {col}
                </span>
              ))}
            </div>

            {recentSims.map((sim, idx) => (
              <div key={sim._id} style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 140px 80px',
                padding: '16px 24px', alignItems: 'center',
                borderBottom: idx < recentSims.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
              }}>
                <span style={{ fontSize: '14px', color: '#ccc' }}>
                  {new Date(sim.createdAt).toLocaleDateString('es-CO')}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#00FF87' }}>
                  {sim.result.projectedIRR.toFixed(1)}%
                </span>
                <span style={statusBadgeStyle(sim.result.statusColor)}>
                  {sim.result.status}
                </span>
                <Link href={`/investor/${sim._id}`} style={{
                  fontSize: '13px', color: '#00FF87', textDecoration: 'none', fontWeight: 500,
                }}>
                  Ver →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
