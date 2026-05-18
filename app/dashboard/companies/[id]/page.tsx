'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getCompany,
  getMySimulations,
  updateCompany,
  Company,
  SimulationHistoryItem,
} from '@/lib/api/company';

export default function CompanyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [simulations, setSimulations] = useState<SimulationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingPublic, setTogglingPublic] = useState(false);

  useEffect(() => {
    Promise.all([getCompany(id), getMySimulations(id)])
      .then(([companyData, simsData]) => {
        setCompany(companyData);
        setSimulations(simsData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleTogglePublic = async () => {
    if (!company || togglingPublic) return;
    setTogglingPublic(true);
    try {
      const updated = await updateCompany(id, { isPublic: !company.isPublic });
      setCompany(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar visibilidad');
    } finally {
      setTogglingPublic(false);
    }
  };

  const sectorBadgeStyle: React.CSSProperties = {
    background: 'rgba(0,255,135,.1)',
    color: '#00FF87',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontFamily: "'Sora', sans-serif",
  };

  const stageBadgeStyle: React.CSSProperties = {
    background: 'rgba(255,184,0,.1)',
    color: '#FFB800',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontFamily: "'Sora', sans-serif",
  };

  const cityBadgeStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,.05)',
    color: '#aaa',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontFamily: "'Sora', sans-serif",
  };

  const statusColor = (color: string): React.CSSProperties => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      green: { bg: 'rgba(0,255,135,.1)', text: '#00FF87' },
      yellow: { bg: 'rgba(255,184,0,.1)', text: '#FFB800' },
      red: { bg: 'rgba(255,59,48,.1)', text: '#ff3b30' },
    };
    const c = colorMap[color] ?? { bg: 'rgba(255,255,255,.05)', text: '#aaa' };
    return {
      background: c.bg,
      color: c.text,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontFamily: "'Sora', sans-serif",
    };
  };

  return (
    <div
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: '40px 32px',
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {/* Back link */}
      <Link
        href="/dashboard/companies"
        style={{
          color: '#888',
          fontSize: '13px',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '24px',
          fontFamily: "'Sora', sans-serif",
        }}
      >
        ← Mis empresas
      </Link>

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(255,59,48,.1)',
            border: '1px solid rgba(255,59,48,.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#ff3b30',
            fontSize: '13px',
            marginBottom: '24px',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <p style={{ color: '#888', fontSize: '15px' }}>Cargando empresa...</p>
      )}

      {/* Content */}
      {!isLoading && company && (
        <>
          {/* Company Header Card */}
          <div
            style={{
              background: '#111',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 12px',
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {company.name}
                </h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={sectorBadgeStyle}>{company.sector}</span>
                  <span style={stageBadgeStyle}>{company.stage}</span>
                  <span style={cityBadgeStyle}>{company.city}</span>
                </div>
              </div>

              {/* isPublic toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                }}
              >
                <span
                  style={{
                    color: '#aaa',
                    fontSize: '13px',
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Visible para inversionistas
                </span>
                <button
                  onClick={handleTogglePublic}
                  disabled={togglingPublic}
                  style={{
                    background: company.isPublic ? '#00FF87' : 'rgba(255,255,255,.1)',
                    border: 'none',
                    borderRadius: '20px',
                    width: '44px',
                    height: '24px',
                    cursor: togglingPublic ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'background .2s',
                    flexShrink: 0,
                  }}
                  aria-label="Toggle visibility"
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: company.isPublic ? '22px' : '3px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left .2s',
                    }}
                  />
                </button>
                <span
                  style={{
                    color: company.isPublic ? '#00FF87' : '#666',
                    fontSize: '12px',
                    fontFamily: "'Sora', sans-serif",
                    minWidth: '44px',
                  }}
                >
                  {company.isPublic ? 'Público' : 'Privado'}
                </span>
              </div>
            </div>

            {company.description && (
              <p
                style={{
                  color: '#888',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: '16px 0 0',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {company.description}
              </p>
            )}

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#00FF87',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '12px',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {company.website} ↗
              </a>
            )}
          </div>

          {/* Simulations Section */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Simulaciones
              </h2>
              <Link
                href={`/simulator?companyId=${id}`}
                style={{
                  background: '#00FF87',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '13px',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                + Nueva simulación
              </Link>
            </div>

            {simulations.length === 0 ? (
              <div
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: '16px',
                  padding: '40px 24px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    color: '#888',
                    fontSize: '14px',
                    margin: '0 0 16px',
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Aún no tienes simulaciones para esta empresa
                </p>
                <Link
                  href={`/simulator?companyId=${id}`}
                  style={{
                    color: '#00FF87',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Crear primera simulación →
                </Link>
              </div>
            ) : (
              <div
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 120px 100px 120px',
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,.06)',
                    color: '#666',
                    fontSize: '12px',
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  <span>Fecha</span>
                  <span>TIR</span>
                  <span>Payback</span>
                  <span>Estado</span>
                  <span></span>
                </div>

                {simulations.map((sim, idx) => (
                  <div
                    key={sim._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 120px 100px 120px',
                      padding: '16px 20px',
                      borderBottom:
                        idx < simulations.length - 1
                          ? '1px solid rgba(255,255,255,.04)'
                          : 'none',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: '#aaa',
                        fontSize: '13px',
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {new Date(sim.createdAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      style={{
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {sim.result?.projectedIRR != null ? `${sim.result.projectedIRR.toFixed(1)}%` : '—'}
                    </span>
                    <span
                      style={{
                        color: '#fff',
                        fontSize: '14px',
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {sim.result?.paybackPeriod != null ? `${sim.result.paybackPeriod.toFixed(1)} meses` : '—'}
                    </span>
                    <span style={statusColor(sim.result.statusColor)}>
                      {sim.result.status}
                    </span>
                    <Link
                      href={`/investor/${sim._id}`}
                      style={{
                        color: '#00FF87',
                        fontSize: '13px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        fontFamily: "'Sora', sans-serif",
                        textAlign: 'right',
                      }}
                    >
                      Ver análisis →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
