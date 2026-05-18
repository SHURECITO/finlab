'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProfile, updateProfile, UserProfile } from '@/lib/api/auth';
import { getMyCompanies, Company } from '@/lib/api/company';

const SECTOR_OPTIONS = [
  { value: 'tecnologia', label: 'Tecnología / SaaS' },
  { value: 'retail', label: 'Retail / Comercio' },
  { value: 'alimentos', label: 'Alimentos y Bebidas' },
  { value: 'servicios', label: 'Servicios Profesionales' },
  { value: 'manufactura', label: 'Manufactura' },
  { value: 'otro', label: 'Otro' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [sector, setSector] = useState('');
  const [city, setCity] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, companiesData] = await Promise.all([
          getProfile(),
          getMyCompanies(),
        ]);
        setProfile(profileData);
        setCompanies(companiesData);
        setBusinessName(profileData.businessName ?? '');
        setSector(profileData.sector ?? '');
        setCity(profileData.city ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando perfil');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updated = await updateProfile({ businessName, sector, city });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  };

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>
          Mi perfil
        </h1>
        <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
          Gestiona tu información personal y de negocio.
        </p>
      </div>

      {/* User info + edit form */}
      <div style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        maxWidth: '600px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#aaa', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 24px' }}>
          Información de cuenta
        </h2>

        {/* Email (read-only) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Correo electrónico</label>
          <input
            style={{ ...inputStyle, color: '#666', cursor: 'not-allowed' }}
            type="email"
            value={profile?.email ?? ''}
            readOnly
          />
        </div>

        {/* Business name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Nombre del negocio</label>
          <input
            style={inputStyle}
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Nombre de tu empresa"
          />
        </div>

        {/* Sector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Sector</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={sector}
            onChange={e => setSector(e.target.value)}
          >
            <option value="">Selecciona un sector</option>
            {SECTOR_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>Ciudad</label>
          <input
            style={inputStyle}
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Ciudad"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 28px',
            background: saving ? 'rgba(0,255,135,.5)' : '#00FF87',
            borderRadius: '10px',
            color: '#000',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {saveSuccess && (
          <p style={{ marginTop: '12px', color: '#00FF87', fontSize: '14px' }}>
            Cambios guardados correctamente.
          </p>
        )}
        {saveError && (
          <p style={{ marginTop: '12px', color: '#ff4444', fontSize: '14px' }}>
            {saveError}
          </p>
        )}
      </div>

      {/* My companies section */}
      <div style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#aaa', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Mis empresas
        </h2>

        {companies.length === 0 ? (
          <div style={{
            background: '#111',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            color: '#555',
          }}>
            No tienes empresas registradas.{' '}
            <Link href="/dashboard/companies/new" style={{ color: '#00FF87', textDecoration: 'none' }}>
              Crea tu primera empresa
            </Link>.
          </div>
        ) : (
          <div style={{
            background: '#111',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {companies.map((company, idx) => (
              <div key={company._id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: idx < companies.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                    {company.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                    {company.sector} · {company.city}
                  </div>
                </div>
                <Link href={`/dashboard/companies/${company._id}`} style={{
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
