"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api/helpers";

// ─── Types ───────────────────────────────────────────────────────────────────

interface YearlyProjection {
  year: number;
  netFlow: number;
  optimistic: number;
  realistic: number;
  pessimistic: number;
}

interface SimulationData {
  _id: string;
  input: {
    requiredCapital: number;
    monthlyRevenue: number;
    monthlyOperatingCosts: number;
    sector: string;
    projectionHorizon: number;
    expectedGrowthRate: number;
  };
  result: {
    projectedIRR: number;
    paybackPeriod: number;
    annualNetFlow: number;
    status: "VIABLE" | "CAUTION" | "NOT_RECOMMENDED";
    statusColor: "green" | "yellow" | "red";
    yearlyProjections: YearlyProjection[];
  };
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<SimulationData["result"]["status"], string> = {
  VIABLE: "VIABLE",
  CAUTION: "PRECAUCIÓN",
  NOT_RECOMMENDED: "NO RECOMENDADO",
};

const STATUS_COLOR: Record<SimulationData["result"]["statusColor"], string> = {
  green: "#00FF87",
  yellow: "#FFB800",
  red: "#FF4444",
};

const COP_LOCALE = "es-CO";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCOP(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return "—";
  return "$" + Math.round(value).toLocaleString(COP_LOCALE);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getFinancingRecommendation(
  status: string,
  irr: number
): {
  title: string;
  description: string;
  recommended: string[];
  avoid: string[];
} {
  if (status === "VIABLE") {
    return {
      title: "Tu proyecto es viable",
      description:
        "Con una TIR del " +
        irr.toFixed(1) +
        "%, tu proyecto puede acceder a financiamiento formal.",
      recommended: [
        "Crédito bancario tradicional",
        "Capital semilla iNNpulsa",
        "Crowdfunding a2censo",
      ],
      avoid: ["Préstamos informales", "Tarjetas de crédito para inversión"],
    };
  }
  if (status === "CAUTION") {
    return {
      title: "Tu proyecto requiere ajustes",
      description:
        "Con una TIR del " +
        irr.toFixed(1) +
        "%, considera alternativas de bajo costo.",
      recommended: [
        "Fondo Emprender SENA",
        "Microcrédito",
        "Capital semilla familiar",
      ],
      avoid: ["Crédito bancario tradicional", "Deuda con tasas altas"],
    };
  }
  return {
    title: "Revisa tu modelo de negocio",
    description:
      "Con una TIR del " +
      irr.toFixed(1) +
      "%, el proyecto no cubre su costo de capital.",
    recommended: [
      "Validar el modelo antes de buscar financiamiento",
      "Fondo Emprender SENA (no requiere devolución)",
    ],
    avoid: ["Cualquier tipo de deuda en este momento"],
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ w = "100%", h = 18 }: { w?: string | number; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: "rgba(255,255,255,0.07)",
      }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Skeleton h={40} w="60%" />
      <Skeleton h={20} w="35%" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Skeleton h={90} />
        <Skeleton h={90} />
        <Skeleton h={90} />
      </div>
      <Skeleton h={160} />
      <Skeleton h={220} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestorSimulationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/simulations/${id}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json() as Promise<SimulationData>;
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("No se pudo cargar el análisis de inversión.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const containerStyle: React.CSSProperties = {
    background: "#0a0a0a",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "'Sora', sans-serif",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: 820,
    margin: "0 auto",
    padding: "64px 24px 96px",
  };

  const cardStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 16,
    padding: 24,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: ".06em",
    marginBottom: 8,
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={innerStyle}>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div style={containerStyle}>
        <div style={{ ...innerStyle, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
          <p style={{ color: "#888", fontSize: 16, marginBottom: 32 }}>
            {error ?? "Análisis no encontrado."}
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 100,
              textDecoration: "none",
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const { result, createdAt } = data;
  const statusColor = STATUS_COLOR[result.statusColor];
  const recommendation = getFinancingRecommendation(result.status, result.projectedIRR);

  const irrColor =
    result.statusColor === "green"
      ? "#00FF87"
      : result.statusColor === "yellow"
      ? "#FFB800"
      : "#FF4444";

  // paybackPeriod is in years — show months if < 1 year
  const paybackDisplay =
    result.paybackPeriod < 1
      ? `${Math.round(result.paybackPeriod * 12)} meses`
      : `${result.paybackPeriod.toFixed(1)} años`;

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        {/* Back link */}
        <Link
          href="/investors"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#555",
            fontSize: 14,
            textDecoration: "none",
            marginBottom: 40,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Directorio de inversores
        </Link>

        {/* Header */}
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
            marginBottom: 8,
          }}
        >
          Análisis de Inversión
        </h1>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 40 }}>
          Generado el {formatDate(createdAt)}
        </p>

        {/* Status card */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
            borderColor: `${statusColor}22`,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: statusColor,
              flexShrink: 0,
              boxShadow: `0 0 12px ${statusColor}88`,
            }}
          />
          <div>
            <div style={labelStyle}>Estado de viabilidad</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: statusColor,
                letterSpacing: "0.04em",
              }}
            >
              {STATUS_LABEL[result.status]}
            </div>
          </div>
        </div>

        {/* Key metrics row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* TIR */}
          <div style={cardStyle}>
            <div style={labelStyle}>TIR / IRR proyectada</div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: irrColor,
                letterSpacing: "-0.02em",
              }}
            >
              {result.projectedIRR.toFixed(1)}%
            </div>
          </div>

          {/* Payback */}
          <div style={cardStyle}>
            <div style={labelStyle}>Período de recuperación</div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              {paybackDisplay}
            </div>
          </div>

          {/* Annual net flow */}
          <div style={cardStyle}>
            <div style={labelStyle}>Flujo neto anual</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: result.annualNetFlow >= 0 ? "#00FF87" : "#FF4444",
                letterSpacing: "-0.02em",
              }}
            >
              {formatCOP(result.annualNetFlow)}
            </div>
          </div>
        </div>

        {/* Financing recommendation */}
        <div
          style={{
            ...cardStyle,
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            {recommendation.title}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#888",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {recommendation.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {/* Recommended */}
            <div
              style={{
                background: "rgba(0,208,132,.06)",
                border: "1px solid rgba(0,208,132,.2)",
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#00D084",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 12,
                }}
              >
                Alternativas recomendadas
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {recommendation.recommended.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 13,
                      color: "#ccc",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: "#00D084",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Avoid */}
            <div
              style={{
                background: "rgba(239,68,68,.06)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#EF4444",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 12,
                }}
              >
                Evitar
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {recommendation.avoid.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 13,
                      color: "#ccc",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: "#EF4444",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✗
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Yearly projections table */}
        {result.yearlyProjections && result.yearlyProjections.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: 32, overflowX: "auto" }}>
            <div style={labelStyle}>Proyecciones por año y escenario</div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,.1)" }}>
                  {(
                    [
                      { label: "Año", align: "left" as const, color: "#777" },
                      { label: "Optimista", align: "right" as const, color: "#00D084" },
                      { label: "Realista", align: "right" as const, color: "#fff" },
                      { label: "Pesimista", align: "right" as const, color: "#FBBF24" },
                    ] as const
                  ).map((col) => (
                    <th
                      key={col.label}
                      style={{
                        padding: "10px 12px",
                        textAlign: col.align,
                        color: col.color,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: 11,
                        letterSpacing: ".06em",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.yearlyProjections.map((proj) => (
                  <tr
                    key={proj.year}
                    style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
                  >
                    <td style={{ padding: "12px", color: "#888" }}>
                      Año {proj.year}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        color: "#00D084",
                        fontWeight: 700,
                      }}
                    >
                      {formatCOP(proj.optimistic)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {formatCOP(proj.realistic)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        color: "#FBBF24",
                        fontWeight: 700,
                      }}
                    >
                      {formatCOP(proj.pessimistic)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,.07)",
            paddingTop: 32,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 13, color: "#444" }}>
            Análisis generado por FinLab
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link
              href="/"
              style={{
                fontSize: 13,
                color: "#666",
                textDecoration: "none",
              }}
            >
              Inicio
            </Link>
            <Link
              href="/simulator"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.15)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 100,
                textDecoration: "none",
              }}
            >
              Crear tu propio análisis →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
