"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicCompanies, PublicCompanySummary } from "@/lib/api/company";

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTORS = [
  "Tecnología",
  "Salud",
  "Educación",
  "Finanzas",
  "Retail",
  "Manufactura",
];

const STAGES: { value: string; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "mvp", label: "MVP" },
  { value: "crecimiento", label: "Crecimiento" },
  { value: "consolidacion", label: "Consolidación" },
];

const VIABILITIES: { value: string; label: string }[] = [
  { value: "VIABLE", label: "Viable" },
  { value: "CAUTION", label: "Precaución" },
  { value: "NOT_RECOMMENDED", label: "No recomendado" },
];

function irrColor(statusColor: string): string {
  if (statusColor === "green") return "#00FF87";
  if (statusColor === "yellow") return "#FFB800";
  return "#FF4444";
}

function statusBadgeStyle(status: string): React.CSSProperties {
  if (status === "VIABLE") {
    return {
      background: "rgba(0,255,135,.15)",
      color: "#00FF87",
      border: "1px solid rgba(0,255,135,.3)",
    };
  }
  if (status === "CAUTION") {
    return {
      background: "rgba(255,184,0,.15)",
      color: "#FFB800",
      border: "1px solid rgba(255,184,0,.3)",
    };
  }
  return {
    background: "rgba(255,68,68,.15)",
    color: "#FF4444",
    border: "1px solid rgba(255,68,68,.3)",
  };
}

function statusLabel(status: string): string {
  if (status === "VIABLE") return "Viable";
  if (status === "CAUTION") return "Precaución";
  return "No recomendado";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvestorsPage() {
  const [companies, setCompanies] = useState<PublicCompanySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [sectorFilter, setSectorFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [viabilityFilter, setViabilityFilter] = useState("");

  useEffect(() => {
    getPublicCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) => {
    if (sectorFilter && c.sector !== sectorFilter) return false;
    if (stageFilter && c.stage !== stageFilter) return false;
    if (viabilityFilter && c.latestSimulation?.result.status !== viabilityFilter) return false;
    return true;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "48px 24px",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            color: "#888",
            textDecoration: "none",
            fontSize: "14px",
            display: "inline-block",
            marginBottom: "24px",
          }}
        >
          ← Inicio
        </Link>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 12px 0",
          }}
        >
          Directorio de oportunidades de inversión
        </h1>
        <p style={{ color: "#888", fontSize: "16px", margin: "0 0 40px 0" }}>
          Empresas colombianas verificadas con análisis financiero
        </p>

        {/* Filter bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            style={{
              background: "#111",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="">Todos los sectores</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            style={{
              background: "#111",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="">Todas las etapas</option>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={viabilityFilter}
            onChange={(e) => setViabilityFilter(e.target.value)}
            style={{
              background: "#111",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="">Todas las viabilidades</option>
            {VIABILITIES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>

          {!loading && (
            <span style={{ color: "#888", fontSize: "14px", marginLeft: "8px" }}>
              {filtered.length} oportunidades encontradas
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", color: "#888", padding: "80px 0" }}>
            Cargando empresas...
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#888", padding: "80px 0" }}>
            No se encontraron empresas con estos filtros.
          </div>
        )}

        {/* Cards grid */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
            }}
          >
            {filtered.map((company) => (
              <div
                key={company._id}
                style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  flex: "1 1 calc(33.333% - 16px)",
                  minWidth: "280px",
                  maxWidth: "calc(33.333% - 16px)",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Name + description */}
                <div>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {company.name}
                  </h2>
                  <p
                    style={{
                      color: "#888",
                      fontSize: "14px",
                      margin: 0,
                      lineHeight: "1.5",
                    }}
                  >
                    {company.description}
                  </p>
                </div>

                {/* Badges row */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "rgba(0,200,100,.15)",
                      color: "#00C864",
                      border: "1px solid rgba(0,200,100,.3)",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {company.sector}
                  </span>
                  <span
                    style={{
                      background: "rgba(255,184,0,.15)",
                      color: "#FFB800",
                      border: "1px solid rgba(255,184,0,.3)",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {company.stage}
                  </span>
                </div>

                {/* City */}
                <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
                  📍 {company.city}
                </p>

                {/* Simulation data or pending */}
                {company.latestSimulation ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "24px" }}>
                      <div>
                        <div style={{ color: "#666", fontSize: "11px", marginBottom: "4px" }}>
                          TIR Proyectada
                        </div>
                        <div
                          style={{
                            fontSize: "22px",
                            fontWeight: 700,
                            color: irrColor(company.latestSimulation.result.statusColor),
                          }}
                        >
                          {company.latestSimulation.result.projectedIRR.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "#666", fontSize: "11px", marginBottom: "4px" }}>
                          Período de retorno
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                          {company.latestSimulation.result.paybackPeriod.toFixed(1)} años
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          ...statusBadgeStyle(company.latestSimulation.result.status),
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {statusLabel(company.latestSimulation.result.status)}
                      </span>

                      <Link
                        href={`/investor/${company.latestSimulation._id}`}
                        style={{
                          color: "#00FF87",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        Ver análisis completo →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <span
                    style={{
                      background: "rgba(255,255,255,.05)",
                      color: "#666",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "inline-block",
                    }}
                  >
                    Análisis pendiente
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
