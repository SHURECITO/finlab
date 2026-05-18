'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMyCompanies, Company } from '@/lib/api/company';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyCompanies()
      .then(setCompanies)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar empresas')
      )
      .finally(() => setIsLoading(false));
  }, []);

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

  const publicBadgeStyle = (isPublic: boolean): React.CSSProperties => ({
    background: isPublic ? 'rgba(0,255,135,.1)' : 'rgba(255,255,255,.05)',
    color: isPublic ? '#00FF87' : '#666',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontFamily: "'Sora', sans-serif",
  });

  return (
    <div
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: '40px 32px',
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#fff',
            margin: 0,
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Mis empresas
        </h1>
        <Link
          href="/dashboard/companies/new"
          style={{
            background: '#00FF87',
            color: '#000',
            fontWeight: 700,
            fontSize: '14px',
            borderRadius: '10px',
            padding: '10px 20px',
            textDecoration: 'none',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          + Nueva empresa
        </Link>
      </div>

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
        <p style={{ color: '#888', fontSize: '15px' }}>Cargando empresas...</p>
      )}

      {/* Empty state */}
      {!isLoading && !error && companies.length === 0 && (
        <div
          style={{
            background: '#111',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: '#888',
              fontSize: '15px',
              marginBottom: '20px',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Aún no tienes empresas registradas
          </p>
          <Link
            href="/dashboard/companies/new"
            style={{
              background: '#00FF87',
              color: '#000',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '10px',
              padding: '10px 20px',
              textDecoration: 'none',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Registrar mi primera empresa
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && companies.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          {companies.map((company) => (
            <div
              key={company._id}
              style={{
                background: '#111',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: '16px',
                padding: '24px',
                flex: '1 1 300px',
                maxWidth: '380px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Name */}
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#fff',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {company.name}
              </div>

              {/* Description */}
              <div
                style={{
                  color: '#888',
                  fontSize: '14px',
                  marginTop: '8px',
                  lineHeight: '1.5',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {company.description}
              </div>

              {/* Badges */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginTop: '4px',
                }}
              >
                <span style={sectorBadgeStyle}>{company.sector}</span>
                <span style={stageBadgeStyle}>{company.stage}</span>
                <span style={publicBadgeStyle(company.isPublic)}>
                  {company.isPublic ? 'Público' : 'Privado'}
                </span>
              </div>

              {/* City */}
              <div
                style={{
                  color: '#666',
                  fontSize: '13px',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {company.city}
              </div>

              {/* Link */}
              <Link
                href={`/dashboard/companies/${company._id}`}
                style={{
                  color: '#00FF87',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginTop: '4px',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Ver detalle →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
