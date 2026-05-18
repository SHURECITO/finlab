'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  simulateCredit,
  SimulationApiResponse,
  CreditResultItem,
  downloadSimulationPdf,
  getSimulationById,
  getFinancingAlternatives,
  FinancingAlternative,
} from '@/lib/api/credit';
import { formatCOP, formatPct, SEMAFORO_COLORS } from '@/lib/formatters';
import DetailPanel from './DetailPanel';

// ---- helpers ----

function handleMontoChange(
  raw: string,
  setMonto: (n: number) => void,
  setMontoDisplay: (s: string) => void,
) {
  const digits = raw.replace(/\D/g, '');
  const num = parseInt(digits || '0', 10);
  setMonto(num);
  setMontoDisplay(num > 0 ? formatCOP(num).replace('$', '') : '');
}

type SortKey = 'tasaEA' | 'cuotaMensual' | 'totalIntereses' | 'totalPagado' | 'vpn';
type SortDir = 'asc' | 'desc';

function sortResultados(
  items: CreditResultItem[],
  key: SortKey,
  dir: SortDir,
): CreditResultItem[] {
  return [...items].sort((a, b) => {
    const av = a[key] as number;
    const bv = b[key] as number;
    return dir === 'asc' ? av - bv : bv - av;
  });
}

// ---- styles ----

const cardStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: '10px',
  padding: '12px 16px',
  color: '#fff',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: "'Sora', sans-serif",
};

const labelStyle: React.CSSProperties = {
  color: '#aaa',
  fontSize: '13px',
  marginBottom: '6px',
  display: 'block',
  fontFamily: "'Sora', sans-serif",
};

const thStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)',
  color: '#666',
  fontSize: '12px',
  textAlign: 'left',
  padding: '12px 16px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  color: '#fff',
  fontSize: '14px',
  borderBottom: '1px solid rgba(255,255,255,.05)',
  verticalAlign: 'middle',
};

// ---- AlternativeCard ----

const CATEGORY_LABEL: Record<string, string> = {
  capital_semilla: 'Capital semilla',
  crowdfunding: 'Crowdfunding',
  equity: 'Equity',
};

interface AlternativeCardProps {
  alt: FinancingAlternative;
  inRange: boolean;
  userMonto?: number;
}

function AlternativeCard({ alt, inRange, userMonto }: AlternativeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: inRange ? 'rgba(0,208,132,.04)' : '#111',
        border: `1px solid ${inRange ? 'rgba(0,208,132,.3)' : 'rgba(255,255,255,.08)'}`,
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        opacity: (!userMonto || inRange) ? 1 : 0.65,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            {alt.name}
          </div>
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
            background: 'rgba(255,255,255,.08)', color: '#aaa', padding: '3px 8px', borderRadius: '100px',
          }}>
            {CATEGORY_LABEL[alt.category] ?? alt.category}
          </span>
        </div>
        {inRange && (
          <span style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em',
            background: '#00D084', color: '#000', padding: '3px 8px', borderRadius: '100px', whiteSpace: 'nowrap',
          }}>
            Aplica para tu monto
          </span>
        )}
        {userMonto && !inRange && (
          <span style={{
            fontSize: '10px', fontWeight: 600,
            color: '#555', whiteSpace: 'nowrap', maxWidth: '120px', textAlign: 'right',
          }}>
            Rango: ${Math.round(alt.montoMinimo / 1_000_000)}M–${Math.round(alt.montoMaximo / 1_000_000)}M
          </span>
        )}
      </div>

      <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, margin: 0 }}>{alt.descripcion}</p>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '4px' }}>Costo</div>
        <div style={{ fontSize: '13px', color: '#00D084', fontWeight: 600 }}>{alt.costoDescripcion}</div>
      </div>

      <div>
        {alt.ventajas.slice(0, 2).map((v) => (
          <div key={v} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: '#ccc', marginBottom: '4px' }}>
            <span style={{ color: '#00D084', flexShrink: 0 }}>✓</span>
            {v}
          </div>
        ))}
      </div>

      {alt.desventajas[0] && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: '#EF444499', marginBottom: '4px' }}>
          <span style={{ color: '#EF4444', flexShrink: 0 }}>✗</span>
          {alt.desventajas[0]}
        </div>
      )}

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alt.desventajas.slice(1).map((d) => (
            <div key={d} style={{ display: 'flex', gap: '6px', fontSize: '13px', color: '#EF444499' }}>
              <span style={{ color: '#EF4444', flexShrink: 0 }}>✗</span>{d}
            </div>
          ))}
          {alt.requisitos.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>Requisitos</div>
              {alt.requisitos.map((r) => (
                <div key={r} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                  <span style={{ color: '#555', flexShrink: 0 }}>·</span>{r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
        <a
          href={alt.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            background: '#00D084', color: '#000', fontFamily: "'Sora', sans-serif",
            fontWeight: 700, fontSize: '13px', padding: '10px 16px', borderRadius: '100px',
            textDecoration: 'none',
          }}
        >
          Aplicar →
        </a>
        <button
          onClick={() => setExpanded((e) => !e)}
          style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,.15)',
            color: '#aaa', fontSize: '12px', fontWeight: 600, padding: '10px 14px',
            borderRadius: '100px', cursor: 'pointer',
          }}
        >
          {expanded ? 'Menos ↑' : 'Ver más ↓'}
        </button>
      </div>
    </div>
  );
}

// ---- Inner component that uses useSearchParams ----

function ComparadorContent() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');

  const [monto, setMonto] = useState<number>(0);
  const [montoDisplay, setMontoDisplay] = useState<string>('');
  const [plazoMeses, setPlazoMeses] = useState<number>(36);
  const [result, setResult] = useState<SimulationApiResponse | null>(null);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('vpn');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [showNonEligible, setShowNonEligible] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<FinancingAlternative[]>([]);

  // Auto-restore simulation from ?id= query param
  useEffect(() => {
    if (!idFromUrl) return;
    setLoading(true);
    getSimulationById(idFromUrl)
      .then((saved) => {
        setResult(saved);
        setSimulationId(idFromUrl);
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setLoading(false));
  }, [idFromUrl]);

  // Load financing alternatives on mount
  useEffect(() => {
    getFinancingAlternatives()
      .then(setAlternatives)
      .catch(() => {/* silently fail */});
  }, []);

  // ---- handlers ----

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (monto <= 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSimulationId(null);
    setExpandedCode(null);
    try {
      const data = await simulateCredit({
        monto,
        plazoMeses,
        proposito: 'libre_inversion',
      });
      setResult(data);
      setSimulationId(data.simulationId ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la simulación');
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return <span style={{ color: '#444' }}>↕</span>;
    return <span style={{ color: '#00D084' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  // ---- derived data ----

  const eligible = result
    ? sortResultados(
        result.resultados.filter(r => r.elegible),
        sortKey,
        sortDir,
      )
    : [];

  const nonEligible = result ? result.resultados.filter(r => !r.elegible) : [];
  const hasStale = result?.resultados.some(r => r.stale === true) ?? false;

  // ---- render ----

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Comparador de Alternativas de Financiamiento
        </h1>
        <p style={{ color: '#888', fontSize: '15px', marginTop: '8px' }}>
          Encuentra la mejor opción de financiación para tu emprendimiento — compara créditos, capital semilla, crowdfunding y más
        </p>
      </div>

      {/* Input form */}
      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Monto */}
            <div>
              <label htmlFor="monto" style={labelStyle}>
                Monto a financiar
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666',
                    fontSize: '14px',
                    pointerEvents: 'none',
                  }}
                >
                  $
                </span>
                <input
                  id="monto"
                  type="text"
                  inputMode="numeric"
                  placeholder="10.000.000"
                  value={montoDisplay}
                  onChange={e =>
                    handleMontoChange(e.target.value, setMonto, setMontoDisplay)
                  }
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                />
              </div>
            </div>

            {/* Plazo */}
            <div>
              <label htmlFor="plazo" style={labelStyle}>
                Plazo en meses
              </label>
              <input
                id="plazo"
                type="number"
                min={1}
                max={120}
                value={plazoMeses}
                onChange={e => setPlazoMeses(Number(e.target.value))}
                style={inputStyle}
              />
              <span
                style={{
                  color: '#555',
                  fontSize: '12px',
                  marginTop: '6px',
                  display: 'block',
                }}
              >
                Plazos típicos: 12, 36, 60 meses
              </span>
            </div>

            {/* Propósito */}
            <div>
              <label htmlFor="proposito" style={labelStyle}>
                Propósito
              </label>
              <select
                id="proposito"
                disabled
                value="Libre Inversión"
                style={{
                  ...inputStyle,
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  appearance: 'none',
                }}
              >
                <option>Libre Inversión</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || monto <= 0}
            style={{
              background: loading || monto <= 0 ? 'rgba(0,208,132,0.4)' : '#00D084',
              color: '#000',
              fontWeight: 700,
              borderRadius: '10px',
              padding: '14px 24px',
              border: 'none',
              cursor: loading || monto <= 0 ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              width: '100%',
              fontFamily: "'Sora', sans-serif",
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Analizando opciones...' : 'Comparar opciones →'}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: 'rgba(255,68,68,0.1)',
            border: '1px solid rgba(255,68,68,0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#FF4444',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Stale data banner */}
          {hasStale && (
            <div
              style={{
                background: 'rgba(255,184,0,0.1)',
                border: '1px solid rgba(255,184,0,0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#FFB800',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              ⚠️ Algunos datos pueden estar desactualizados. Los precios mostrados son referenciales.
            </div>
          )}

          {/* Recommendation card + PDF download */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div
              style={{
                flex: 1,
                background: 'rgba(0,208,132,0.08)',
                border: '1px solid rgba(0,208,132,0.2)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <span
                style={{
                  color: '#00D084',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                ✅ Mejor opción
              </span>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#fff',
                  marginTop: '8px',
                  marginBottom: '6px',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {result.recomendacion.mejorOpcion}
              </div>
              <div style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.5' }}>
                {result.recomendacion.razon}
              </div>
            </div>

            {/* PDF download button */}
            {simulationId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'flex-start' }}>
                <button
                  onClick={() => {
                    setDownloadingPdf(true);
                    setPdfError(null);
                    downloadSimulationPdf(simulationId, 'summary')
                      .catch(() => setPdfError('No se pudo generar el PDF. Intenta nuevamente.'))
                      .finally(() => setDownloadingPdf(false));
                  }}
                  disabled={downloadingPdf}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'transparent', border: '1px solid rgba(255,255,255,.2)',
                    color: '#fff', fontSize: '14px', fontWeight: 600, padding: '10px 20px',
                    borderRadius: '100px', cursor: downloadingPdf ? 'not-allowed' : 'pointer',
                    opacity: downloadingPdf ? 0.6 : 1,
                  }}
                >
                  {downloadingPdf ? 'Generando...' : '📄 Descargar PDF resumen'}
                </button>
                {pdfError && <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>{pdfError}</p>}
              </div>
            )}
          </div>

          {/* Results table */}
          {eligible.length === 0 ? (
            <div
              style={{
                ...cardStyle,
                textAlign: 'center',
                color: '#555',
                fontSize: '15px',
              }}
            >
              No se encontraron opciones disponibles para el monto y plazo ingresados.
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Entidad</th>
                      <th
                        style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('tasaEA')}
                      >
                        Tasa EA {sortIndicator('tasaEA')}
                      </th>
                      <th
                        style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('cuotaMensual')}
                      >
                        Cuota Mensual {sortIndicator('cuotaMensual')}
                      </th>
                      <th
                        style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('totalIntereses')}
                      >
                        Total Intereses {sortIndicator('totalIntereses')}
                      </th>
                      <th
                        style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('totalPagado')}
                      >
                        Total Pagado {sortIndicator('totalPagado')}
                      </th>
                      <th
                        style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('vpn')}
                      >
                        VPN {sortIndicator('vpn')}
                      </th>
                      <th style={thStyle}>Semáforo</th>
                      <th style={{ ...thStyle, padding: '10px 12px', color: '#777', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '.06em' }}>
                        Solicitar
                      </th>
                      <th style={thStyle}>Ver detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligible.map(item => (
                      <>
                        <tr
                          key={item.entidad.code}
                          style={{
                            background:
                              expandedCode === item.entidad.code
                                ? 'rgba(255,255,255,.02)'
                                : 'transparent',
                          }}
                        >
                          <td style={tdStyle}>
                            <span
                              style={{
                                fontWeight: 600,
                                color: '#fff',
                                fontSize: '14px',
                              }}
                            >
                              {item.entidad.name}
                            </span>
                            <br />
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#555',
                                textTransform: 'capitalize',
                              }}
                            >
                              {item.entidad.type}
                            </span>
                          </td>
                          <td style={tdStyle}>{formatPct(item.tasaEA)}</td>
                          <td style={tdStyle}>{formatCOP(item.cuotaMensual)}</td>
                          <td style={tdStyle}>{formatCOP(item.totalIntereses)}</td>
                          <td style={tdStyle}>{formatCOP(item.totalPagado)}</td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>
                            {formatCOP(item.vpn)}
                          </td>
                          <td style={tdStyle}>
                            <span
                              style={{
                                background: SEMAFORO_COLORS[item.semaforo].bg,
                                color: SEMAFORO_COLORS[item.semaforo].text,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {SEMAFORO_COLORS[item.semaforo].label}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {item.entidad.applyUrl ? (
                              <a
                                href={item.entidad.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: 'rgba(0,208,132,.1)',
                                  border: '1px solid rgba(0,208,132,.3)',
                                  color: '#00D084',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Solicitar en {item.entidad.name} →
                              </a>
                            ) : (
                              <span title="Enlace no disponible" style={{ fontSize: '12px', color: '#555', cursor: 'not-allowed' }}>
                                No disponible
                              </span>
                            )}
                          </td>
                          <td style={tdStyle}>
                            <button
                              onClick={() =>
                                setExpandedCode(
                                  expandedCode === item.entidad.code
                                    ? null
                                    : item.entidad.code,
                                )
                              }
                              style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,.15)',
                                borderRadius: '8px',
                                color: '#aaa',
                                padding: '6px 14px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: "'Sora', sans-serif",
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {expandedCode === item.entidad.code ? 'Cerrar ↑' : 'Ver →'}
                            </button>
                          </td>
                        </tr>

                        {/* Detail panel */}
                        {expandedCode === item.entidad.code && (
                          <tr key={`detail-${item.entidad.code}`}>
                            <td
                              colSpan={9}
                              style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,.05)' }}
                            >
                              <DetailPanel
                                item={result!.resultados.find(r => r.entidad.code === expandedCode)!}
                                simulationId={simulationId}
                                onClose={() => setExpandedCode(null)}
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Non-eligible section */}
          {nonEligible.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => setShowNonEligible(s => !s)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: '10px',
                  color: '#666',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: "'Sora', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: showNonEligible ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  ▼
                </span>
                Opciones no disponibles para tu monto ({nonEligible.length})
              </button>

              {showNonEligible && (
                <div style={{ ...cardStyle, marginTop: '12px' }}>
                  {nonEligible.map((item, idx) => (
                    <div
                      key={item.entidad.code}
                      style={{
                        paddingBottom: idx < nonEligible.length - 1 ? '16px' : 0,
                        marginBottom: idx < nonEligible.length - 1 ? '16px' : 0,
                        borderBottom:
                          idx < nonEligible.length - 1
                            ? '1px solid rgba(255,255,255,.05)'
                            : 'none',
                      }}
                    >
                      <span
                        style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}
                      >
                        {item.entidad.name}
                      </span>
                      <span style={{ color: '#555', fontSize: '13px', marginLeft: '12px' }}>
                        {item.razonNoElegible ?? 'No disponible para el monto solicitado'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Otras alternativas section */}
          {alternatives.length > 0 && (
            <section style={{ marginTop: '56px' }}>
              <p style={{ fontSize: '13px', color: '#555', fontStyle: 'italic', marginBottom: '24px' }}>
                * La recomendación se calcula solo entre créditos. Revisa también las otras alternativas abajo.
              </p>

              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '8px' }}>
                Otras alternativas de financiamiento
              </h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '28px', maxWidth: '600px' }}>
                Estas opciones tienen lógicas distintas a un crédito tradicional, pero pueden complementar o sustituir tu financiación.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {alternatives.map((alt) => {
                  const inRange = result
                    ? alt.montoMinimo <= result.monto && result.monto <= alt.montoMaximo
                    : false;

                  return (
                    <AlternativeCard key={alt.code} alt={alt} inRange={inRange} userMonto={result?.monto} />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty state (after submission, no eligible results, no error) */}
      {result && eligible.length === 0 && nonEligible.length === 0 && !error && (
        <div
          style={{
            ...cardStyle,
            textAlign: 'center',
            color: '#555',
            fontSize: '15px',
          }}
        >
          No se encontraron opciones disponibles para el monto y plazo ingresados.
        </div>
      )}

      {/* Otras alternativas when no credit result yet */}
      {!result && alternatives.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '8px' }}>
            Otras alternativas de financiamiento
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '28px', maxWidth: '600px' }}>
            Estas opciones tienen lógicas distintas a un crédito tradicional, pero pueden complementar o sustituir tu financiación.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {alternatives.map((alt) => (
              <AlternativeCard key={alt.code} alt={alt} inRange={false} userMonto={undefined} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ---- Main export wrapped in Suspense for useSearchParams ----

export default function ComparadorAlternativasPage() {
  return (
    <Suspense fallback={<div style={{ color: '#666', padding: '40px', fontFamily: "'Sora', sans-serif" }}>Cargando...</div>}>
      <ComparadorContent />
    </Suspense>
  );
}
