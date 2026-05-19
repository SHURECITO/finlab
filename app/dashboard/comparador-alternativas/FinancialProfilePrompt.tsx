'use client';

import { useState, useEffect } from 'react';
import { getSectors, setFinancialProfile, SectorInfo } from '@/lib/api/credit';
import { formatCOP } from '@/lib/formatters';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

const FIELD_DEFS = {
  activos: {
    label: 'Activos totales',
    placeholder: 'Ej: 50.000.000',
    definition:
      'Todo lo que tu empresa posee: efectivo, cuentas por cobrar, inventario, maquinaria, propiedades, vehículos, etc. (en COP)',
  },
  ingresosMensuales: {
    label: 'Ingresos mensuales',
    placeholder: 'Ej: 10.000.000',
    definition:
      'Dinero que entra por ventas de productos o servicios cada mes, ANTES de descontar gastos. (en COP)',
  },
  gastosMensuales: {
    label: 'Gastos operativos mensuales',
    placeholder: 'Ej: 7.000.000',
    definition:
      'Arriendo, salarios, servicios públicos, materia prima, transporte, marketing y demás costos mensuales. (en COP)',
  },
} as const;

type NumericField = keyof typeof FIELD_DEFS;

export default function FinancialProfilePrompt({ onComplete, onSkip }: Props) {
  const [sectors, setSectors] = useState<SectorInfo[]>([]);
  const [values, setValues] = useState<Record<NumericField, string>>({
    activos: '',
    ingresosMensuales: '',
    gastosMensuales: '',
  });
  const [sector, setSector] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSectors().then(setSectors).catch(() => {});
  }, []);

  const allFilled =
    values.activos && values.ingresosMensuales && values.gastosMensuales && sector;

  const handleNumericChange = (field: NumericField, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setValues((prev) => ({ ...prev, [field]: digits }));
  };

  const handleSave = async () => {
    if (!allFilled) {
      setError('Debes completar los 4 campos. Si no tienes los datos, usa el botón de abajo.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await setFinancialProfile({
        activos: parseInt(values.activos, 10),
        ingresosMensuales: parseInt(values.ingresosMensuales, 10),
        gastosMensuales: parseInt(values.gastosMensuales, 10),
        sectorEconomico: sector,
      });
      onComplete();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await setFinancialProfile({ skip: true });
    } catch {
      // best-effort
    } finally {
      setSubmitting(false);
      onSkip();
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: 0, fontFamily: "'Sora', sans-serif" }}>
          Cuéntanos sobre tu empresa
        </h2>
        <p style={{ color: '#888', fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
          Con estos 4 datos calcularemos el <strong style={{ color: '#ccc' }}>VPN</strong> y la{' '}
          <strong style={{ color: '#ccc' }}>TIR</strong> de cada crédito usando el{' '}
          <strong style={{ color: '#ccc' }}>WACC sectorial</strong> de referencia (Damodaran — ajustado para Colombia).
          Si no tienes los datos disponibles, puedes continuar sin ellos.
        </p>
      </div>

      <div
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
        }}
      >
        {(Object.keys(FIELD_DEFS) as NumericField[]).map((field) => {
          const def = FIELD_DEFS[field];
          const numVal = parseInt(values[field] || '0', 10);
          return (
            <div key={field} style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {def.label}
              </label>
              <p style={{ color: '#666', fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>
                {def.definition}
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={values[field] ? parseInt(values[field], 10).toLocaleString('es-CO') : ''}
                onChange={(e) => handleNumericChange(field, e.target.value.replace(/\./g, ''))}
                placeholder={def.placeholder}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: "'Sora', sans-serif",
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              {numVal > 0 && (
                <p style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                  {formatCOP(numVal)}
                </p>
              )}
            </div>
          );
        })}

        <div>
          <label style={{ display: 'block', color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            Sector económico
          </label>
          <p style={{ color: '#666', fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>
            Determina el WACC (costo promedio del capital) de referencia para tu industria, basado en datos
            de Damodaran ajustados para mercados emergentes (Colombia).
          </p>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 8,
              color: sector ? '#fff' : '#666',
              fontSize: 14,
              fontFamily: "'Sora', sans-serif",
              boxSizing: 'border-box',
              outline: 'none',
            }}
          >
            <option value="">Selecciona tu sector...</option>
            {sectors.map((s) => (
              <option key={s.code} value={s.code} style={{ background: '#111', color: '#fff' }}>
                {s.name} — WACC {(s.wacc * 100).toFixed(1)}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={submitting || !allFilled}
          style={{
            padding: '14px 20px',
            background: allFilled ? '#00D084' : '#222',
            border: 'none',
            borderRadius: 10,
            color: allFilled ? '#000' : '#555',
            fontWeight: 700,
            fontSize: 15,
            cursor: allFilled && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.6 : 1,
            fontFamily: "'Sora', sans-serif",
            transition: 'background 0.2s',
          }}
        >
          {submitting ? 'Guardando...' : 'Guardar y ver análisis financiero →'}
        </button>

        <button
          onClick={handleSkip}
          disabled={submitting}
          style={{
            padding: '13px 20px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 10,
            color: '#666',
            fontSize: 13,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          No cuento con estos datos · Continuar sin análisis financiero
        </button>
      </div>

      <p style={{ color: '#444', fontSize: 11, marginTop: 16, textAlign: 'center', lineHeight: 1.5 }}>
        Sin datos financieros el comparador funciona normalmente, pero no calculará VPN ni TIR.
        Puedes actualizar tu perfil más adelante.
      </p>
    </div>
  );
}
