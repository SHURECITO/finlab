'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createCompany } from '@/lib/api/company';

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('tecnologia');
  const [city, setCity] = useState('');
  const [stage, setStage] = useState('idea');
  const [foundedYear, setFoundedYear] = useState<number>(new Date().getFullYear());
  const [website, setWebsite] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const newCompany = await createCompany({
        name,
        description,
        sector,
        city,
        stage,
        foundedYear,
        website: website || undefined,
        isPublic,
      });
      router.push(`/dashboard/companies/${newCompany._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    fontFamily: "'Sora', sans-serif",
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#aaa',
    fontSize: '13px',
    marginBottom: '6px',
    fontFamily: "'Sora', sans-serif",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer',
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
        ← Volver a mis empresas
      </Link>

      <div
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '560px',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 8px',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Nueva empresa
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#888',
            margin: '0 0 32px',
            lineHeight: '1.5',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Registra tu empresa para gestionar simulaciones financieras
        </p>

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
              marginBottom: '20px',
              lineHeight: '1.5',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Nombre */}
          <div>
            <label htmlFor="name" style={labelStyle}>
              Nombre de la empresa
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" style={labelStyle}>
              Descripción corta
            </label>
            <textarea
              id="description"
              required
              rows={3}
              placeholder="máx. 200 caracteres"
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: '1.5',
              }}
            />
          </div>

          {/* Sector */}
          <div>
            <label htmlFor="sector" style={labelStyle}>
              Sector
            </label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              style={selectStyle}
            >
              <option value="tecnologia">Tecnología</option>
              <option value="retail">Retail</option>
              <option value="alimentos">Alimentos</option>
              <option value="servicios">Servicios</option>
              <option value="manufactura">Manufactura</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Ciudad */}
          <div>
            <label htmlFor="city" style={labelStyle}>
              Ciudad
            </label>
            <input
              id="city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Etapa */}
          <div>
            <label htmlFor="stage" style={labelStyle}>
              Etapa
            </label>
            <select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={selectStyle}
            >
              <option value="idea">Idea</option>
              <option value="mvp">MVP</option>
              <option value="crecimiento">En crecimiento</option>
              <option value="consolidacion">Consolidada</option>
            </select>
          </div>

          {/* Año de fundación */}
          <div>
            <label htmlFor="foundedYear" style={labelStyle}>
              Año de fundación
            </label>
            <input
              id="foundedYear"
              type="number"
              min={1900}
              max={2030}
              value={foundedYear}
              onChange={(e) => setFoundedYear(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          {/* Sitio web */}
          <div>
            <label htmlFor="website" style={labelStyle}>
              Sitio web <span style={{ color: '#666' }}>(opcional)</span>
            </label>
            <input
              id="website"
              type="text"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Visible para inversionistas */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: '10px',
              padding: '14px 16px',
            }}
          >
            <label
              htmlFor="isPublic"
              style={{
                color: '#aaa',
                fontSize: '14px',
                fontFamily: "'Sora', sans-serif",
                cursor: 'pointer',
              }}
            >
              Visible para inversionistas
            </label>
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#00FF87' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: isLoading ? 'rgba(0,255,135,.5)' : '#00FF87',
              color: '#000',
              fontWeight: 700,
              fontSize: '15px',
              borderRadius: '10px',
              padding: '14px',
              width: '100%',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Sora', sans-serif",
              marginTop: '4px',
              transition: 'background .2s',
            }}
          >
            {isLoading ? 'Creando empresa...' : 'Crear empresa'}
          </button>
        </form>
      </div>
    </div>
  );
}
