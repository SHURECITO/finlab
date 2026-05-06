"use client";

import { useScrollObserver } from "./useScrollObserver";

export function StatsSection() {
  const addRef = useScrollObserver();

  return (
    <div className="stats-band">
      <div className="stats-inner">
        <div className="stat-item animate-on-scroll" ref={addRef}>
          <div className="stat-value" data-target="50" data-suffix="%">
            0%
          </div>
          <div className="stat-desc">
            de emprendedores cierran antes del 1er año por mala gestión.
          </div>
        </div>
        <div className="stat-item animate-on-scroll delay-1" ref={addRef}>
          <div className="stat-value" data-target="5" data-suffix="">
            0
          </div>
          <div className="stat-desc">
            años de proyecciones financieras precisas en segundos.
          </div>
        </div>
        <div className="stat-item animate-on-scroll delay-2" ref={addRef}>
          <div className="stat-value" data-target="0" data-suffix="">
            0
          </div>
          <div className="stat-desc">
            puntos de costo oculto. Transparencia total en simulaciones.
          </div>
        </div>
        <div className="stat-item animate-on-scroll delay-3" ref={addRef}>
          <div className="stat-value" data-target="3" data-suffix="">
            0
          </div>
          <div className="stat-desc">
            escenarios estratégicos para cada decisión de inversión.
          </div>
        </div>
      </div>
    </div>
  );
}
