"use client";

import { useScrollObserver } from "./useScrollObserver";

export function UsersSection() {
  const addRef = useScrollObserver();

  return (
    <section id="about">
      <div className="section-inner">
        <div className="section-head center animate-on-scroll" ref={addRef}>
          <h2 className="section-title">¿Quién usa FinLab?</h2>
          <p className="section-sub">
            Diseñamos soluciones para emprendedores que necesitan datos reales,
            no solo suposiciones.
          </p>
        </div>
        <div className="who-grid">
          <div className="who-card animate-on-scroll" ref={addRef}>
            <div className="who-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 2L2 7l9 5 9-5-9-5zM2 17l9 5 9-5M2 12l9 5 9-5"
                  stroke="#00D084"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="who-title">Etapa Inicial</div>
            <p className="who-desc">
              Emprendedores que están estructurando su primer modelo financiero y
              necesitan validar su viabilidad de mercado con datos reales.
            </p>
            <a href="#" className="who-link">
              Leer más →
            </a>
          </div>
          <div className="who-card animate-on-scroll delay-1" ref={addRef}>
            <div className="who-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="16"
                  height="16"
                  rx="3"
                  stroke="#00D084"
                  strokeWidth="1.6"
                />
                <path
                  d="M7 11h8M7 7.5h5M7 14.5h3"
                  stroke="#00D084"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="who-title">Sin Historial Bancario</div>
            <p className="who-desc">
              Negocios con potencial que no encuentran respaldo en la banca
              tradicional y buscan alternativas de financiamiento sólidas.
            </p>
            <a href="#" className="who-link">
              Leer más →
            </a>
          </div>
          <div className="who-card animate-on-scroll delay-2" ref={addRef}>
            <div className="who-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M3 16l4-5.5 4 3 4-5 4 4"
                  stroke="#00D084"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="4" r="2" fill="#00D084" />
              </svg>
            </div>
            <div className="who-title">Fase de Expansión</div>
            <p className="who-desc">
              Empresas consolidadas que planean abrir nuevos mercados o lanzar
              productos y requieren simular el ROI esperado con precisión.
            </p>
            <a href="#" className="who-link">
              Leer más →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
