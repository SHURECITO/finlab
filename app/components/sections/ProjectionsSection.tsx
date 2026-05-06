"use client";

import { useScrollObserver } from "./useScrollObserver";

export function ProjectionsSection() {
  const addRef = useScrollObserver();

  return (
    <section id="projections">
      <div className="section-inner">
        <div className="section-head center animate-on-scroll" ref={addRef}>
          <h2 className="section-title">Proyecciones por Escenario</h2>
          <p className="section-sub">
            No te limites a un solo futuro. Visualiza el crecimiento potencial de
            tu negocio bajo diferentes condiciones.
          </p>
        </div>
        <div className="proj-grid">
          <div className="proj-card proj-dark animate-on-scroll" ref={addRef}>
            <div className="proj-badge">Escenario 1</div>
            <div className="proj-pct">+22%</div>
            <div className="proj-name">Optimista</div>
            <p className="proj-desc">
              Proyección donde tu margen neto y operativos crecen conforme a lo
              esperado en el mercado objetivo.
            </p>
            <div className="proj-bar">
              <div className="proj-bar-fill" data-width="88%"></div>
            </div>
          </div>
          <div className="proj-card proj-white animate-on-scroll delay-1" ref={addRef}>
            <div className="proj-badge">Escenario 2</div>
            <div className="proj-pct">+14%</div>
            <div className="proj-name">Probable</div>
            <p className="proj-desc">
              Estimación realista siguiendo las tendencias actuales del mercado y el
              crecimiento ajustado del sector.
            </p>
            <div className="proj-bar">
              <div className="proj-bar-fill" data-width="60%"></div>
            </div>
          </div>
          <div className="proj-card proj-light animate-on-scroll delay-2" ref={addRef}>
            <div className="proj-badge">Escenario 3</div>
            <div className="proj-pct">+6%</div>
            <div className="proj-name">Pesimista</div>
            <p className="proj-desc">
              Predicción para condiciones adversas de mercado y patrones históricos
              bajos en el sector.
            </p>
            <div className="proj-bar">
              <div className="proj-bar-fill" data-width="26%"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
