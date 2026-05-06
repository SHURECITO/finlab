"use client";

import { useState } from "react";
import Link from "next/link";
import { runSimulation, type SimulationResponse } from "@/lib/api/simulation";

const DEFAULT_CAPITAL = 50000000;
const DEFAULT_REVENUE = 8000000;
const DEFAULT_COSTS = 5000000;
const DEFAULT_SECTOR = "tecnologia";
const DEFAULT_HORIZON = 3;
const DEFAULT_GROWTH = 15;
const COP_LOCALE = "es-CO";
const CURRENCY_PREFIX = "$";
const RESULT_SCROLL_DELAY_MS = 100;

type SectorValue =
  | "tecnologia"
  | "retail"
  | "alimentos"
  | "servicios"
  | "manufactura"
  | "otro";

const STATUS_CLASS_MAP: Record<SimulationResponse["statusColor"], string> = {
  green: "viability-result",
  yellow: "viability-warning",
  red: "viability-danger",
};

const STATUS_TEXT_CLASS_MAP: Record<
  SimulationResponse["statusColor"],
  { label: string; value: string }
> = {
  green: { label: "vr-label", value: "vr-val" },
  yellow: { label: "vr-warning-label", value: "vr-warning-val" },
  red: { label: "vr-danger-label", value: "vr-danger-val" },
};

function getFinancingRecommendation(
  status: string,
  irr: number,
): {
  title: string;
  description: string;
  recommended: string[];
  avoid: string[];
} {
  if (status === "VIABLE") {
    return {
      title: "✅ Tu proyecto es viable",
      description:
        "Con una TIR del " +
        irr.toFixed(1) +
        "%, tu proyecto puede acceder a financiamiento formal.",
      recommended: [
        "Crédito bancario tradicional",
        "Capital semilla iNNpulsa",
        "Crowdfunding a2censo",
      ],
      avoid: [
        "Préstamos informales",
        "Tarjetas de crédito para inversión",
      ],
    };
  }
  if (status === "CAUTION") {
    return {
      title: "⚠️ Tu proyecto requiere ajustes",
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
    title: "🔴 Revisa tu modelo de negocio",
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

export function SimulatorPageContent() {
  const [capital, setCapital] = useState<number>(DEFAULT_CAPITAL);
  const [ingresos, setIngresos] = useState<number>(DEFAULT_REVENUE);
  const [costos, setCostos] = useState<number>(DEFAULT_COSTS);
  const [sector, setSector] = useState<SectorValue>(DEFAULT_SECTOR);
  const [horizon, setHorizon] = useState<1 | 3 | 5>(DEFAULT_HORIZON);
  const [growth, setGrowth] = useState<number>(DEFAULT_GROWTH);
  const [results, setResults] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCOP = (value: number) =>
    CURRENCY_PREFIX + Math.round(value).toLocaleString(COP_LOCALE);

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await runSimulation({
        requiredCapital: capital,
        monthlyRevenue: ingresos,
        monthlyOperatingCosts: costos,
        sector,
        projectionHorizon: horizon,
        expectedGrowthRate: growth,
      });
      setResults(response);
      setTimeout(() => {
        document
          .getElementById("simResults")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, RESULT_SCROLL_DELAY_MS);
    } catch {
      setResults(null);
      setError("No se pudo calcular la proyección financiera.");
    } finally {
      setIsLoading(false);
    }
  };

  const showResults = Boolean(results) || Boolean(error);
  const netFlowYearOne = results?.yearlyProjections[0]?.netFlow;
  const statusClass = results ? STATUS_CLASS_MAP[results.statusColor] : "";
  const statusTextClasses = results
    ? STATUS_TEXT_CLASS_MAP[results.statusColor]
    : null;
  const recommendation = results
    ? getFinancingRecommendation(results.status, results.projectedIRR)
    : null;

  return (
    <div
      style={{
        background: "#0A0A0A",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "64px 24px 80px",
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#666",
            fontSize: "14px",
            textDecoration: "none",
            marginBottom: "40px",
            transition: "color .2s",
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
          Volver al inicio
        </Link>

        {/* Page title */}
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(30px, 5vw, 46px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
            marginBottom: "12px",
          }}
        >
          Simulador Financiero
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#888",
            lineHeight: "1.6",
            marginBottom: "48px",
          }}
        >
          Ingresa los datos de tu negocio para obtener una proyección financiera
        </p>

        {/* Form */}
        <div className="sim-form">
          <div className="form-group">
            <label className="form-label">Capital requerido (COP)</label>
            <input
              className="form-input"
              type="number"
              placeholder="ej. 50000000"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Ingresos mensuales actuales (COP)
            </label>
            <input
              className="form-input"
              type="number"
              placeholder="ej. 8000000"
              value={ingresos}
              onChange={(e) => setIngresos(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Costos operativos mensuales (COP)
            </label>
            <input
              className="form-input"
              type="number"
              placeholder="ej. 5000000"
              value={costos}
              onChange={(e) => setCostos(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sector</label>
            <select
              className="form-input form-select"
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorValue)}
            >
              <option value="tecnologia">Tecnología / SaaS</option>
              <option value="retail">Retail / Comercio</option>
              <option value="alimentos">Alimentos y Bebidas</option>
              <option value="servicios">Servicios Profesionales</option>
              <option value="manufactura">Manufactura</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="form-group full">
            <label className="form-label">
              Horizonte de proyección: <span>{horizon}</span> años
            </label>
            <div className="range-wrap">
              <div className="range-row">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="2"
                  value={horizon}
                  onChange={(e) =>
                    setHorizon(Number(e.target.value) as 1 | 3 | 5)
                  }
                />
                <span className="range-val">{horizon}</span>
              </div>
            </div>
          </div>
          <div className="form-group full">
            <label className="form-label">
              Tasa de crecimiento esperada: <span>{growth}</span>%
            </label>
            <div className="range-wrap">
              <div className="range-row">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={growth}
                  onChange={(e) => setGrowth(Number(e.target.value))}
                />
                <span className="range-val">{growth}%</span>
              </div>
            </div>
          </div>
          <div className="form-group full">
            <button
              className="btn-simulate"
              onClick={handleSimulate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div> Calculando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M9 2v2M9 14v2M2 9h2M14 9h2M4.22 4.22l1.41 1.41M12.37 12.37l1.41 1.41M4.22 13.78l1.41-1.41M12.37 5.63l1.41-1.41"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="9"
                      cy="9"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  Calcular proyección financiera
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div
          className={`sim-results ${showResults ? "show" : ""}`}
          id="simResults"
          style={{ marginTop: "24px" }}
        >
          <div className="results-title">📊 Resultados de tu simulación</div>
          {error && (
            <div className="loading-indicator">{error}</div>
          )}
          <div className="results-grid">
            <div className="result-box">
              <div className="result-box-label">TIR Proyectada</div>
              <div className="result-box-val val-green">
                {results ? `${results.projectedIRR.toFixed(1)}%` : "—"}
              </div>
            </div>
            <div className="result-box">
              <div className="result-box-label">Payback</div>
              <div className="result-box-val val-white">
                {results ? `${results.paybackPeriod.toFixed(1)} años` : "—"}
              </div>
            </div>
            <div className="result-box">
              <div className="result-box-label">Flujo Neto (año 1)</div>
              <div className="result-box-val val-green">
                {netFlowYearOne !== undefined
                  ? formatCOP(netFlowYearOne)
                  : "—"}
              </div>
            </div>
          </div>
          {results && statusTextClasses && (
            <div className={statusClass} style={{ marginTop: "16px" }}>
              <span className={statusTextClasses.label}>
                Estado de viabilidad
              </span>
              <span className={statusTextClasses.value}>{results.status}</span>
            </div>
          )}

          {/* Yearly projections table */}
          {results && results.yearlyProjections.length > 0 && (
            <div style={{ marginTop: "24px", overflowX: "auto" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#777",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: "12px",
                }}
              >
                Proyecciones por escenario
              </div>
              <table
                style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
              >
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid rgba(255,255,255,.1)" }}
                  >
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        color: "#777",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "11px",
                        letterSpacing: ".06em",
                      }}
                    >
                      Año
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        color: "#00D084",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "11px",
                        letterSpacing: ".06em",
                      }}
                    >
                      Optimista
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "11px",
                        letterSpacing: ".06em",
                      }}
                    >
                      Realista
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        color: "#FBBF24",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "11px",
                        letterSpacing: ".06em",
                      }}
                    >
                      Pesimista
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyProjections.map((proj) => (
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
                          fontFamily: "'Sora', sans-serif",
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
                          fontFamily: "'Sora', sans-serif",
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
                          fontFamily: "'Sora', sans-serif",
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

          <p
            style={{ marginTop: "16px", fontSize: "12px", color: "#555" }}
          >
            * Proyección basada en datos ingresados. Los resultados son
            estimativos y no constituyen asesoramiento financiero oficial.
          </p>
        </div>

        {/* Financing recommendation */}
        {recommendation && (
          <div
            style={{
              marginTop: "24px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            <h3
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              {recommendation.title}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#888",
                lineHeight: "1.6",
                marginBottom: "24px",
              }}
            >
              {recommendation.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Recommended */}
              <div
                style={{
                  background: "rgba(0,208,132,.06)",
                  border: "1px solid rgba(0,208,132,.2)",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#00D084",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: "14px",
                  }}
                >
                  Alternativas recomendadas
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recommendation.recommended.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "13px",
                        color: "#ccc",
                        lineHeight: "1.5",
                      }}
                    >
                      <span style={{ color: "#00D084", flexShrink: 0, marginTop: "1px" }}>✓</span>
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
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#EF4444",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: "14px",
                  }}
                >
                  Evitar
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recommendation.avoid.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "13px",
                        color: "#ccc",
                        lineHeight: "1.5",
                      }}
                    >
                      <span style={{ color: "#EF4444", flexShrink: 0, marginTop: "1px" }}>✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <Link
                href="/#financing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.15)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "12px 24px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  transition: "background .2s",
                }}
              >
                Ver catálogo completo de financiamiento →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
