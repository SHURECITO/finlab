'use client';

import { useState } from 'react';
import { CreditResultItem, getExcelDownloadUrl, downloadSimulationPdf } from '@/lib/api/credit';
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

export default function DetailPanel({ item, simulationId, onClose }: DetailPanelProps) {
  const [showAllAmort, setShowAllAmort] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const { tablasComparativas: tc, tablaAmortizacion: amort, plazoUsuario } = (() => {
    return {
      tablasComparativas: item.tablasComparativas,
      tablaAmortizacion: item.tablaAmortizacion,
      plazoUsuario: item.tablaAmortizacion.length,
    };
  })();

  const semaforo = SEMAFORO_COLORS[item.semaforo];

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

      {/* Download buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {simulationId && (
          <button
            onClick={() => window.open(getExcelDownloadUrl(simulationId), '_blank')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: '8px',
              color: '#aaa',
              padding: '9px 18px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            ⬇ Descargar Excel
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
      {pdfError && <p style={{ fontSize: '13px', color: '#EF4444', marginTop: '8px' }}>{pdfError}</p>}
    </div>
  );
}
