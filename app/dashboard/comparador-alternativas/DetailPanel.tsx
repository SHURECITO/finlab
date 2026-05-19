'use client';

import { useState, useEffect } from 'react';
import { CreditResultItem, downloadSimulationPdf, runFinancialAnalysis, FinancialAnalysisResponse } from '@/lib/api/credit';
import { API_BASE_URL } from '@/lib/api/helpers';
import { formatCOP, SEMAFORO_COLORS } from '@/lib/formatters';

interface DetailPanelProps {
  item: CreditResultItem;
  simulationId: string | null;
  onClose: () => void;
}

const sectionLabelStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '12px',
  display: 'block',
};

const innerThStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)',
  color: '#666',
  fontSize: '12px',
  textAlign: 'left',
  padding: '10px 14px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const innerTdStyle: React.CSSProperties = {
  padding: '12px 14px',
  color: '#fff',
  fontSize: '13px',
  borderBottom: '1px solid rgba(255,255,255,.05)',
  verticalAlign: 'middle',
};

async function downloadExcel(simulationId: string): Promise<void> {
  const { getToken } = await import('@/lib/auth');
  const token = getToken();
  if (!token) throw new Error('No autenticado');

  const res = await fetch(`${API_BASE_URL}/credit/export/${simulationId}/xlsx`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Excel error ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  a.download = match?.[1] ?? 'finlab-simulacion.xlsx';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DetailPanel({ item, simulationId, onClose }: DetailPanelProps) {
  const [showAllAmort, setShowAllAmort] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [financialAnalysis, setFinancialAnalysis] = useState<FinancialAnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<'no_profile' | string | null>(null);

  const { tablasComparativas: tc, tablaAmortizacion: amort, plazoUsuario } = (() => {
    return {
      tablasComparativas: item.tablasComparativas,
      tablaAmortizacion: item.tablaAmortizacion,
      plazoUsuario: item.tablaAmortizacion.length,
    };
  })();

  const semaforo = SEMAFORO_COLORS[item.semaforo];

  useEffect(() => {
    if (!simulationId) return;
    setFinancialAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(true);
    runFinancialAnalysis(simulationId, item.entidad.code)
      .then((data) => setFinancialAnalysis(data))
      .catch((err: unknown) => {
        const e = err as Error & { hasFinancialProfile?: boolean };
        if (e.hasFinancialProfile === false) {
          setAnalysisError('no_profile');
        } else {
          setAnalysisError(e.message ?? 'Error al calcular análisis financiero.');
        }
      })
      .finally(() => setAnalysisLoading(false));
  }, [simulationId, item.entidad.code]);

  const totalRows = amort.length;
  let visibleRows: typeof amort;
  let showToggle = false;

  if (totalRows <= 24 || showAllAmort) {
    visibleRows = amort;
    showToggle = totalRows > 24;
  } else {
    visibleRows = [...amort.slice(0, 12), ...amort.slice(totalRows - 6)];
    showToggle = true;
  }

  const needsGap = totalRows > 24 && !showAllAmort;
  const firstPart = needsGap ? amort.slice(0, 12) : null;
  const lastPart = needsGap ? amort.slice(totalRows - 6) : null;

  return (
    <div
      style={{
        padding: '24px',
        background: 'rgba(255,255,255,.03)',
        borderRadius: '12px',
        position: 'relative',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Cerrar detalle"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: '8px',
          color: '#aaa',
          padding: '4px 10px',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          fontFamily: "'Sora', sans-serif",
        }}
      >
        ×
      </button>

      {/* Header */}
      <div style={{ marginBottom: '20px', paddingRight: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 800,
              color: '#fff',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {item.entidad.name}
          </h3>
          <span
            style={{
              background: semaforo.bg,
              color: semaforo.text,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {semaforo.label}
          </span>
        </div>

        {/* Apply CTA at the top */}
        {item.entidad.applyUrl && (
          <a
            href={item.entidad.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#00D084',
              color: '#000',
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              padding: '12px 24px',
              borderRadius: '100px',
              textDecoration: 'none',
              marginTop: '16px',
              marginBottom: '24px',
            }}
          >
            Solicitar en {item.entidad.name} →
          </a>
        )}

        {/* Interpretacion quote block */}
        {item.interpretacion && (
          <div
            style={{
              marginTop: item.entidad.applyUrl ? '0' : '16px',
              background: 'rgba(255,255,255,.04)',
              borderLeft: '3px solid #00D084',
              borderRadius: '0 10px 10px 0',
              padding: '16px 20px',
              color: '#ccc',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            {item.interpretacion}
          </div>
        )}
      </div>

      {/* Comparative plazos table */}
      <div style={{ marginBottom: '28px' }}>
        <span style={sectionLabelStyle}>Comparación por plazo</span>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
            <thead>
              <tr>
                <th style={innerThStyle}>Plazo</th>
                <th style={innerThStyle}>Cuota Mensual</th>
                <th style={innerThStyle}>Total Intereses</th>
                <th style={innerThStyle}>Total Pagado</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  { label: '12 meses', data: tc.plazo12, months: 12 },
                  { label: '36 meses', data: tc.plazo36, months: 36 },
                  { label: '60 meses', data: tc.plazo60, months: 60 },
                  { label: `${plazoUsuario} meses`, data: tc.plazoUsuario, months: plazoUsuario },
                ] as const
              ).map(row => {
                const isUser = row.months === plazoUsuario;
                const rowBg = isUser ? 'rgba(0,208,132,.06)' : 'transparent';
                return (
                  <tr key={row.months} style={{ background: rowBg }}>
                    <td style={{ ...innerTdStyle, fontWeight: isUser ? 700 : 400, color: isUser ? '#00D084' : '#fff' }}>
                      {row.label}{isUser ? ' ✦' : ''}
                    </td>
                    <td style={innerTdStyle}>{formatCOP(row.data.cuota)}</td>
                    <td style={innerTdStyle}>{formatCOP(row.data.totalIntereses)}</td>
                    <td style={innerTdStyle}>{formatCOP(row.data.totalPagado)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Amortization table */}
      <div style={{ marginBottom: '28px' }}>
        <span style={sectionLabelStyle}>
          Tabla de amortización{' '}
          <span style={{ color: '#444', fontWeight: 400, textTransform: 'none', fontSize: '11px' }}>
            (Sistema Francés)
          </span>
        </span>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ ...innerThStyle, position: 'sticky', left: 0, background: '#111', zIndex: 1 }}>
                  Mes
                </th>
                <th style={innerThStyle}>Saldo Inicial</th>
                <th style={innerThStyle}>Cuota</th>
                <th style={innerThStyle}>Interés</th>
                <th style={innerThStyle}>Abono Capital</th>
                <th style={innerThStyle}>Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              {needsGap && firstPart ? (
                <>
                  {firstPart.map(row => (
                    <tr key={row.mes}>
                      <td style={{ ...innerTdStyle, position: 'sticky', left: 0, background: '#111', zIndex: 1 }}>
                        {row.mes}
                      </td>
                      <td style={innerTdStyle}>{formatCOP(row.saldoInicial)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.cuota)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.interes)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.abonoCapital)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.saldoFinal)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: 'center',
                        padding: '8px 14px',
                        color: '#444',
                        fontSize: '13px',
                        borderBottom: '1px solid rgba(255,255,255,.05)',
                      }}
                    >
                      <button
                        onClick={() => setShowAllAmort(true)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#00D084',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontFamily: "'Sora', sans-serif",
                          padding: '4px 8px',
                        }}
                      >
                        Mostrar todos ({totalRows}) ▼
                      </button>
                    </td>
                  </tr>
                  {lastPart!.map(row => (
                    <tr key={row.mes}>
                      <td style={{ ...innerTdStyle, position: 'sticky', left: 0, background: '#111', zIndex: 1 }}>
                        {row.mes}
                      </td>
                      <td style={innerTdStyle}>{formatCOP(row.saldoInicial)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.cuota)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.interes)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.abonoCapital)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.saldoFinal)}</td>
                    </tr>
                  ))}
                </>
              ) : (
                <>
                  {visibleRows.map(row => (
                    <tr key={row.mes}>
                      <td style={{ ...innerTdStyle, position: 'sticky', left: 0, background: '#111', zIndex: 1 }}>
                        {row.mes}
                      </td>
                      <td style={innerTdStyle}>{formatCOP(row.saldoInicial)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.cuota)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.interes)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.abonoCapital)}</td>
                      <td style={innerTdStyle}>{formatCOP(row.saldoFinal)}</td>
                    </tr>
                  ))}
                  {showToggle && showAllAmort && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: 'center',
                          padding: '8px 14px',
                          borderBottom: '1px solid rgba(255,255,255,.05)',
                        }}
                      >
                        <button
                          onClick={() => setShowAllAmort(false)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontFamily: "'Sora', sans-serif",
                            padding: '4px 8px',
                          }}
                        >
                          Mostrar menos ▲
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial analysis section */}
      {simulationId && (
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <span style={{ color: '#666', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 16 }}>
            Análisis financiero del proyecto
          </span>

          {analysisLoading && (
            <p style={{ color: '#555', fontSize: 13 }}>Calculando VPN y TIR...</p>
          )}

          {analysisError === 'no_profile' && (
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 16 }}>
              <p style={{ color: '#ccc', fontSize: 14, marginBottom: 6 }}>
                💡 Completa tu perfil financiero para ver VPN y TIR
              </p>
              <p style={{ color: '#666', fontSize: 12, lineHeight: 1.6 }}>
                Necesitas 4 datos: activos, ingresos mensuales, gastos mensuales y sector. La próxima vez que inicies una simulación se te solicitarán.
              </p>
            </div>
          )}

          {analysisError && analysisError !== 'no_profile' && (
            <p style={{ color: '#666', fontSize: 13 }}>{analysisError}</p>
          )}

          {financialAnalysis && (
            <>
              {/* KPI row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  {
                    label: 'VPN',
                    value: formatCOP(financialAnalysis.vpn),
                    color: financialAnalysis.vpn >= 0 ? '#00D084' : '#EF4444',
                    hint: financialAnalysis.vpn >= 0 ? 'Proyecto genera valor' : 'Proyecto destruye valor',
                  },
                  {
                    label: 'TIR',
                    value: `${(financialAnalysis.tir * 100).toFixed(2)}%`,
                    color: financialAnalysis.tir > financialAnalysis.wacc ? '#00D084' : '#EF4444',
                    hint: `vs WACC ${(financialAnalysis.wacc * 100).toFixed(1)}%`,
                  },
                  {
                    label: 'WACC sectorial',
                    value: `${(financialAnalysis.wacc * 100).toFixed(1)}%`,
                    color: '#888',
                    hint: financialAnalysis.sectorInfo.name,
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    style={{
                      background: 'rgba(255,255,255,.03)',
                      border: '1px solid rgba(255,255,255,.07)',
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      {kpi.label}
                    </div>
                    <div style={{ color: kpi.color, fontSize: 18, fontWeight: 800 }}>{kpi.value}</div>
                    <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{kpi.hint}</div>
                  </div>
                ))}
              </div>

              {/* Evaluation banner */}
              <div
                style={{
                  background:
                    financialAnalysis.evaluacion === 'rentable'
                      ? 'rgba(0,208,132,0.08)'
                      : financialAnalysis.evaluacion === 'marginal'
                      ? 'rgba(255,165,0,0.08)'
                      : 'rgba(239,68,68,0.08)',
                  borderLeft: `4px solid ${
                    financialAnalysis.evaluacion === 'rentable'
                      ? '#00D084'
                      : financialAnalysis.evaluacion === 'marginal'
                      ? '#FFA500'
                      : '#EF4444'
                  }`,
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 16px',
                  marginBottom: 16,
                }}
              >
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {financialAnalysis.evaluacion === 'rentable' && '✅ Proyecto rentable'}
                  {financialAnalysis.evaluacion === 'marginal' && '⚠️ Proyecto marginalmente rentable'}
                  {financialAnalysis.evaluacion === 'no_rentable' && '❌ Proyecto no rentable'}
                </p>
                <p style={{ color: '#aaa', fontSize: 12, lineHeight: 1.6 }}>
                  {financialAnalysis.explicacion}
                </p>
              </div>

              {/* Cash flow table */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#666', fontSize: 11, fontWeight: 600 }}>
                  Proyección 5 años · Inflación Banrep: {(financialAnalysis.cashFlowProjection.inflacionAnualUsada * 100).toFixed(2)}% anual
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 11, color: '#ccc', borderCollapse: 'collapse', minWidth: 480 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                      {['Año', 'Cap. Trabajo', 'FCO', 'FCI', 'FCP'].map((h) => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Año' ? 'left' : 'right', color: '#555', fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {financialAnalysis.cashFlowProjection.years.map((y) => (
                      <tr key={y.year} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                        <td style={{ padding: '8px 10px' }}>Año {y.year}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCOP(y.capitalDeTrabajo)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCOP(y.flujoCajaOperativo)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCOP(y.flujoCajaInversion)}</td>
                        <td
                          style={{
                            padding: '8px 10px',
                            textAlign: 'right',
                            color: y.flujoCajaProyecto >= 0 ? '#00D084' : '#EF4444',
                            fontWeight: 600,
                          }}
                        >
                          {formatCOP(y.flujoCajaProyecto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: '#444', fontSize: 10, marginTop: 6 }}>
                FCO: Flujo de Caja Operativo · FCI: Flujo de Caja de Inversión · FCP: Flujo de Caja del Proyecto
              </p>
            </>
          )}
        </div>
      )}

      {/* Download buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {simulationId && (
          <button
            onClick={() => {
              setDownloadingExcel(true);
              setExcelError(null);
              downloadExcel(simulationId)
                .catch(() => setExcelError('No se pudo descargar el Excel.'))
                .finally(() => setDownloadingExcel(false));
            }}
            disabled={downloadingExcel}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: '8px',
              color: '#aaa',
              padding: '9px 18px',
              cursor: downloadingExcel ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontFamily: "'Sora', sans-serif",
              opacity: downloadingExcel ? 0.6 : 1,
            }}
          >
            {downloadingExcel ? 'Descargando...' : '⬇ Descargar Excel'}
          </button>
        )}

        {simulationId && (
          <button
            onClick={() => {
              setDownloadingPdf(true);
              setPdfError(null);
              downloadSimulationPdf(simulationId, 'detailed', item.entidad.code)
                .catch(() => setPdfError('No se pudo generar el PDF.'))
                .finally(() => setDownloadingPdf(false));
            }}
            disabled={downloadingPdf}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'transparent', border: '1px solid rgba(255,255,255,.2)',
              color: '#ccc', fontSize: '13px', fontWeight: 600, padding: '10px 18px',
              borderRadius: '100px', cursor: downloadingPdf ? 'not-allowed' : 'pointer',
            }}
          >
            {downloadingPdf ? 'Generando...' : '📄 Descargar PDF detallado'}
          </button>
        )}
      </div>
      {excelError && <p style={{ fontSize: '13px', color: '#EF4444', marginTop: '8px' }}>{excelError}</p>}
      {pdfError && <p style={{ fontSize: '13px', color: '#EF4444', marginTop: '8px' }}>{pdfError}</p>}
    </div>
  );
}
