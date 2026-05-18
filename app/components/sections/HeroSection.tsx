"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";

const HERO_METRICS = [
  { tir: "12.5%", m1: "18.4%", m2: "14.2%" },
  { tir: "13.1%", m1: "19.0%", m2: "14.8%" },
  { tir: "11.9%", m1: "17.7%", m2: "13.6%" },
  { tir: "14.2%", m1: "20.1%", m2: "15.3%" },
];

const FLICKER_INTERVAL_MS = 3500;
const FLICKER_DURATION_MS = 200;

export function HeroSection() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroFlicker, setHeroFlicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroFlicker(true);
      setTimeout(() => {
        setHeroIdx((prev) => (prev + 1) % HERO_METRICS.length);
        setHeroFlicker(false);
      }, FLICKER_DURATION_MS);
    }, FLICKER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (event: MouseEvent<HTMLElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const currentMetric = HERO_METRICS[heroIdx];

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-badge">
            <div className="hero-badge-dot"></div>
            Plataforma FinLab para emprendedores
          </div>
          <h1>
            Toma decisiones financieras con <span className="accent">menor riesgo</span>
          </h1>
          <p className="hero-desc">
            Simula el impacto de tus decisiones a 1, 3 y 5 años con datos
            objetivos. FinLab te ayuda a crecer sin necesidad de historial
            bancario previo.
          </p>
          <div className="hero-actions">
            <Link href="/auth/register" className="btn-primary">
              Simular mi negocio
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <button
              className="btn-secondary"
              onClick={(e) => scrollToSection(e, "about")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M6.5 6.2C6.5 5.37 7.17 4.7 8 4.7c.83 0 1.5.67 1.5 1.5 0 1-1.5 1.5-1.5 2.5M8 11.5v.01"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              ¿Cómo funciona?
            </button>
          </div>
        </div>
        <div className="hero-right text-black">
          <div className="sim-card">
            <div className="sim-header">
              <span className="sim-header-left">Simulación en tiempo real</span>
              <div className="sim-header-right">
                <div className="live-dot"></div>
                <span>
                  {new Date().toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="sim-body">
              <div className="sim-label">Resumen de Escenario</div>
              <div className="sim-row">
                <div>
                  <div className="sim-sub">Capital Solicitado</div>
                  <div className="sim-amount">$50.000.000</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="sim-sub">Tasa TIR</div>
                  <div
                    className="sim-tir"
                    style={{
                      opacity: heroFlicker ? 0 : 1,
                      transition: "opacity 0.4s",
                    }}
                  >
                    {currentMetric.tir}
                  </div>
                </div>
              </div>
              <div className="viability-bar">
                <span className="viability-label">Cobertura de Deuda</span>
                <span className="viability-val">66% — Viable</span>
              </div>
              <div className="sim-metrics">
                <div className="metric-box">
                  <div className="metric-label">TIR Financiero</div>
                  <div
                    className="metric-val"
                    style={{
                      opacity: heroFlicker ? 0 : 1,
                      transition: "opacity 0.4s",
                    }}
                  >
                    {currentMetric.m1}
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Payback</div>
                  <div
                    className="metric-val"
                    style={{
                      opacity: heroFlicker ? 0 : 1,
                      transition: "opacity 0.4s",
                    }}
                  >
                    {currentMetric.m2}
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Riesgo</div>
                  <div className="metric-val">Medio</div>
                </div>
              </div>
              <div className="sim-footnote">
                Basado en el <strong>Escenario Óptimo</strong> a 5 años
              </div>
            </div>
            <div className="sim-footer">
              <div className="viable-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2.5 2.5L8 3"
                    stroke="#0B7A4B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Escenario Óptimo — Viable
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
