"use client";

import { type MouseEvent } from "react";
import { useScrollObserver } from "./useScrollObserver";

export function CtaSection() {
  const addRef = useScrollObserver();

  const scrollToSection = (event: MouseEvent<HTMLElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="cta-section">
      <div className="section-inner">
        <div className="animate-on-scroll" ref={addRef}>
          <h2 className="section-title">
            ¿Listo para ver el futuro
            <br />
            de tu negocio?
          </h2>
          <p className="section-sub">
            Únete a más de 500 emprendedores que ya están tomando decisiones
            basadas en datos. Sin compromisos, sin historial previo.
          </p>
          <div className="cta-actions">
            <button
              className="btn-cta"
              onClick={(e) => scrollToSection(e, "simulator-section")}
            >
              Empezar simulación ahora
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3.5 9h11M10 4.5l4.5 4.5-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="trust-line">
            <span>✓ Sin registro requerido</span>
            <div className="trust-sep"></div>
            <span>✓ Sin historial bancario</span>
            <div className="trust-sep"></div>
            <span>✓ Resultados en segundos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { type MouseEvent } from "react";
import { useScrollObserver } from "./useScrollObserver";

export function CtaSection() {
  const addRef = useScrollObserver();

  const scrollToSection = (event: MouseEvent<HTMLElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="cta-section">
      <div className="section-inner">
        <div className="animate-on-scroll" ref={addRef}>
          <h2 className="section-title">
            ¿Listo para ver el futuro
            <br />
            de tu negocio?
          </h2>
          <p className="section-sub">
            Únete a más de 500 emprendedores que ya están tomando decisiones
            basadas en datos. Sin compromisos, sin historial previo.
          </p>
          <div className="cta-actions">
            <button
              className="btn-cta"
              onClick={(e) => scrollToSection(e, "simulator-section")}
            >
              Empezar simulación ahora
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3.5 9h11M10 4.5l4.5 4.5-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="trust-line">
            <span>✓ Sin registro requerido</span>
            <div className="trust-sep"></div>
            <span>✓ Sin historial bancario</span>
            <div className="trust-sep"></div>
            <span>✓ Resultados en segundos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
