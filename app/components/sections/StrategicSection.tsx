"use client";

import { useScrollObserver } from "./useScrollObserver";

export function StrategicSection() {
  const addRef = useScrollObserver();

  return (
    <section className="strategic-bg">
      <div className="section-inner">
        <div className="section-head center animate-on-scroll" ref={addRef}>
          <h2 className="section-title">Análisis Estratégico</h2>
        </div>
        <div className="analysis-grid">
          <div className="analysis-card animate-on-scroll" ref={addRef}>
            <div className="analysis-head">
              <div className="analysis-icon-wrap icon-green">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7l3.5 3.5L11.5 3"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="analysis-h">Fortalezas</span>
            </div>
            <ul className="analysis-list">
              <li className="analysis-item">
                <div className="dot-green"></div>
                <p>Modelo de negocio altamente escalable con bajos costos fijos.</p>
              </li>
              <li className="analysis-item">
                <div className="dot-green"></div>
                <p>Propuesta de valor única enfocada en transparencia total.</p>
              </li>
              <li className="analysis-item">
                <div className="dot-green"></div>
                <p>Tecnología propia de simulación financiera avanzada.</p>
              </li>
              <li className="analysis-item">
                <div className="dot-green"></div>
                <p>Equipo con experiencia en fintech y banca de inversión.</p>
              </li>
            </ul>
          </div>
          <div className="analysis-card animate-on-scroll delay-1" ref={addRef}>
            <div className="analysis-head">
              <div className="analysis-icon-wrap icon-red">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4 4l6 6M10 4L4 10"
                    stroke="#EF4444"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="analysis-h">Debilidades</span>
            </div>
            <ul className="analysis-list">
              <li className="analysis-item">
                <div className="dot-red"></div>
                <p>
                  Dependencia inicial de la adquisición de usuarios mediante pauta.
                </p>
              </li>
              <li className="analysis-item">
                <div className="dot-red"></div>
                <p>
                  Falta de historial bancario consolidado de los usuarios objetivo.
                </p>
              </li>
              <li className="analysis-item">
                <div className="dot-red"></div>
                <p>Curva de aprendizaje moderada para usuarios no técnicos.</p>
              </li>
              <li className="analysis-item">
                <div className="dot-red"></div>
                <p>
                  Necesidad de integración manual con sistemas contables locales.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
