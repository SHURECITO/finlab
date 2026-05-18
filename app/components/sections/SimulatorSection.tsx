"use client";

import { useState } from "react";
import Link from "next/link";
import { runSimulation, type SimulationResponse } from "@/lib/api/simulation";
import { useScrollObserver } from "./useScrollObserver";

const RESULT_SCROLL_DELAY_MS = 100;
const DEFAULT_CAPITAL = 50000000;
const DEFAULT_REVENUE = 8000000;
const DEFAULT_COSTS = 5000000;
const DEFAULT_SECTOR = "tecnologia";
const DEFAULT_HORIZON = 3;
const DEFAULT_GROWTH = 15;
const COP_LOCALE = "es-CO";
const CURRENCY_PREFIX = "$";

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

export function SimulatorSection() {
  const addRef = useScrollObserver();

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
    } catch (err) {
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

  return (
    <section id="simulator-section">
      <div className="section-inner">
        <div
          className="section-head center animate-on-scroll"
          style={{ marginBottom: "48px" }}
          ref={addRef}
        >
          <h2 className="section-title" style={{ color: "#fff" }}>
            Simula tu negocio ahora
          </h2>
          <p
            className="section-sub"
            style={{ color: "#777", margin: "12px auto 0" }}
          >
            Ingresa los datos de tu empresa y obtén proyecciones financieras en
            segundos. Sin registro previo.
          </p>
        </div>
        <div className="sim-form animate-on-scroll" ref={addRef}>
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
            <label className="form-label">Ingresos mensuales actuales (COP)</label>
            <input
              className="form-input"
              type="number"
              placeholder="ej. 8000000"
              value={ingresos}
              onChange={(e) => setIngresos(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Costos operativos mensuales (COP)</label>
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
            <a
              href="/simulator"
              style={{
                display: "block",
                textAlign: "center",
                fontSize: "13px",
                color: "var(--green)",
                textDecoration: "none",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              Para un análisis completo →
            </a>
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
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#666' }}>
              ¿Quieres guardar tus simulaciones?{' '}
              <Link href="/auth/register" style={{ color: '#00FF87', textDecoration: 'none' }}>
                Crea tu cuenta gratis →
              </Link>
            </p>
          </div>
        </div>
        <div className={`sim-results ${showResults ? "show" : ""}`} id="simResults">
          <div className="results-title">📊 Resultados de tu simulación</div>
          {error && <div className="loading-indicator">{error}</div>}
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
                {netFlowYearOne !== undefined ? formatCOP(netFlowYearOne) : "—"}
              </div>
            </div>
          </div>
          {results && statusTextClasses && (
            <div className={statusClass} style={{ marginTop: "16px" }}>
              <span className={statusTextClasses.label}>Estado de viabilidad</span>
              <span className={statusTextClasses.value}>{results.status}</span>
            </div>
          )}
          <p
            style={{
              marginTop: "16px",
              fontSize: "12px",
              color: "#555",
            }}
          >
            * Proyección basada en datos ingresados. Los resultados son
            estimativos y no constituyen asesoramiento financiero oficial.
          </p>
        </div>
      </div>
    </section>
  );
}
