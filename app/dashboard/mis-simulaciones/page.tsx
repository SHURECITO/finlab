'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserSimulations, deleteSimulation, type SimulationSummary } from '@/lib/api/credit';

interface SimulationRecord extends SimulationSummary {}

function formatCOP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CO');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function SkeletonRow() {
  const cell: React.CSSProperties = { height: '16px', borderRadius: '6px', background: 'rgba(255,255,255,.07)' };
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
      {[140, 100, 60, 120, 120].map((w, i) => (
        <td key={i} style={{ padding: '14px 12px' }}>
          <div style={{ ...cell, width: `${w}px` }} />
        </td>
      ))}
    </tr>
  );
}

export default function MisSimulacionesPage() {
  const [sims, setSims] = useState<SimulationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadSims = () => {
    setLoading(true);
    getUserSimulations()
      .then((data) => setSims(data as SimulationRecord[]))
      .catch(() => setError('No se pudieron cargar las simulaciones.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSims(); }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm('¿Eliminar esta simulación? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    deleteSimulation(id)
      .then(() => setSims((prev) => prev.filter((s) => s.id !== id)))
      .catch(() => alert('No se pudo eliminar la simulación.'))
      .finally(() => setDeleting(null));
  };

  const th: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left',
    color: '#555',
    fontWeight: 700,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: '8px' }}>
        Mis Simulaciones
      </h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
        Historial de comparaciones guardadas
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '12px', padding: '16px', color: '#EF4444', fontSize: '14px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {!loading && !error && sims.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            Aún no has hecho ninguna simulación.
            <br />Empieza por el Comparador de Alternativas.
          </p>
          <Link
            href="/dashboard/comparador-alternativas"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#00D084', color: '#000', fontFamily: "'Sora', sans-serif",
              fontWeight: 700, fontSize: '14px', padding: '12px 24px',
              borderRadius: '100px', textDecoration: 'none',
            }}
          >
            Ir al Comparador →
          </Link>
        </div>
      )}

      {(loading || sims.length > 0) && (
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <th style={th}>Fecha</th>
                <th style={th}>Monto</th>
                <th style={th}>Plazo</th>
                <th style={th}>Mejor opción</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : sims.map((sim) => (
                  <tr key={sim.id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <td style={{ padding: '14px 12px', color: '#888' }}>{formatDate(sim.createdAt)}</td>
                    <td style={{ padding: '14px 12px', color: '#fff', fontWeight: 600 }}>{formatCOP(sim.monto)}</td>
                    <td style={{ padding: '14px 12px', color: '#ccc' }}>{sim.plazoMeses} meses</td>
                    <td style={{ padding: '14px 12px', color: '#00D084', fontWeight: 600 }}>{sim.mejorOpcion || '—'}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          href={`/dashboard/comparador-alternativas?id=${sim.id}`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
                            color: '#fff', fontSize: '12px', fontWeight: 600, padding: '6px 12px',
                            borderRadius: '8px', textDecoration: 'none',
                          }}
                        >
                          Ver →
                        </Link>
                        <button
                          onClick={() => handleDelete(sim.id)}
                          disabled={deleting === sim.id}
                          style={{
                            background: 'transparent', border: '1px solid rgba(239,68,68,.3)',
                            color: '#EF4444', fontSize: '12px', fontWeight: 600, padding: '6px 12px',
                            borderRadius: '8px', cursor: deleting === sim.id ? 'not-allowed' : 'pointer',
                            opacity: deleting === sim.id ? 0.5 : 1,
                          }}
                        >
                          {deleting === sim.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
