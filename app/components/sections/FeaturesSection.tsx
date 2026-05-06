"use client";

import { useScrollObserver } from "./useScrollObserver";

export function FeaturesSection() {
  const addRef = useScrollObserver();

  return (
    <section className="features-bg" id="financing">
      <div className="section-inner">
        <div className="features-head-row">
          <div className="animate-on-scroll" ref={addRef}>
            <h2 className="section-title">
              ¿Qué puedes hacer
              <br />
              con FinLab?
            </h2>
            <p className="section-sub">
              Nuestra tecnología transforma variables financieras complejas en planes
              de acción comprensibles.
            </p>
          </div>
          <a href="#" className="features-link animate-on-scroll" ref={addRef}>
            Ver todas las funciones →
          </a>
        </div>
        <div className="features-grid">
          <div className="feat-card animate-on-scroll" ref={addRef}>
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2 15l4-6 4 3 4-5 4 4"
                  stroke="#00D084"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="feat-title">Análisis de Impacto</div>
            <p className="feat-desc">
              Entiende cómo un cambio en tus costos fijos afecta tu margen neto en el
              largo plazo.
            </p>
          </div>
          <div className="feat-card animate-on-scroll delay-1" ref={addRef}>
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="#00D084" strokeWidth="1.4" />
                <path
                  d="M10 6v4l3 3"
                  stroke="#00D084"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="feat-title">Simulación de Escenarios</div>
            <p className="feat-desc">
              Compara trayectorias optimistas y pesimistas para estar preparado ante
              cualquier crisis.
            </p>
          </div>
          <div className="feat-card animate-on-scroll delay-2" ref={addRef}>
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  x="3"
                  y="6"
                  width="14"
                  height="11"
                  rx="2"
                  stroke="#00D084"
                  strokeWidth="1.4"
                />
                <path
                  d="M7 6V5a3 3 0 016 0v1M8 11h4"
                  stroke="#00D084"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="feat-title">Alternativas Bancarias</div>
            <p className="feat-desc">
              Ejecuta opciones de financiamiento basadas en datos reales, fuera de la
              banca tradicional.
            </p>
          </div>
          <div className="feat-card animate-on-scroll delay-3" ref={addRef}>
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"
                  stroke="#00D084"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="10" r="3" stroke="#00D084" strokeWidth="1.4" />
              </svg>
            </div>
            <div className="feat-title">Análisis de Riesgo</div>
            <p className="feat-desc">
              Identifica los focos financieros débiles antes de que se conviertan en
              problemas reales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
