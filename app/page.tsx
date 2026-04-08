"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  // Simulator states
  const [capital, setCapital] = useState<number>(50000000);
  const [ingresos, setIngresos] = useState<number>(8000000);
  const [costos, setCostos] = useState<number>(5000000);
  const [sector, setSector] = useState("tech");
  const [horizon, setHorizon] = useState(3);
  const [growth, setGrowth] = useState(15);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState<{
    show: boolean;
    tir?: string;
    payback?: string;
    flujo?: string;
    viable?: boolean;
    coverageRatio?: string;
  }>({ show: false });

  // Hero flicker states
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroFlicker, setHeroFlicker] = useState(false);

  const observerRefs = useRef<(Element | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) setScrollProgress((window.scrollY / h) * 100);
      setIsScrolled(window.scrollY > 40);
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const animateCounter = (el: Element) => {
      const target = +(el.getAttribute("data-target") || 0);
      const suffix = el.getAttribute("data-suffix") || "";
      let start = 0;
      const dur = 1500;
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            const counter = e.target.querySelector("[data-target]");
            if (counter) animateCounter(counter);

            e.target.querySelectorAll(".proj-bar-fill").forEach((bar) => {
              (bar as HTMLElement).style.width =
                (bar as HTMLElement).dataset.width || "0";
            });
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observerRefs.current.forEach((el) => {
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const metrics = [
      { tir: "12.5%", m1: "18.4%", m2: "14.2%" },
      { tir: "13.1%", m1: "19.0%", m2: "14.8%" },
      { tir: "11.9%", m1: "17.7%", m2: "13.6%" },
      { tir: "14.2%", m1: "20.1%", m2: "15.3%" },
    ];

    const interval = setInterval(() => {
      setHeroFlicker(true);
      setTimeout(() => {
        setHeroIdx((prev) => (prev + 1) % metrics.length);
        setHeroFlicker(false);
      }, 200);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const formatCOP = (n: number) => "$" + Math.round(n).toLocaleString("es-CO");

  const handleSimulate = async () => {
    setIsSimulating(true);
    await new Promise((r) => setTimeout(r, 900));

    const g = growth / 100;
    const margenMensual = ingresos - costos;
    const margenAnual = margenMensual * 12;
    const flujoNeto1 = margenAnual * (1 + g);
    const paybackYears = capital / margenAnual;

    const cashflows = [-capital];
    for (let y = 1; y <= horizon; y++) {
      cashflows.push(margenAnual * Math.pow(1 + g, y));
    }

    const npv = (rate: number, cfs: number[]) =>
      cfs.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0);

    let irr = 0.15;
    for (let i = 0; i < 50; i++) {
      const n = npv(irr, cashflows);
      const dn = (npv(irr + 0.001, cashflows) - n) / 0.001;
      if (Math.abs(dn) < 1e-10) break;
      irr = irr - n / dn;
      if (irr < -0.99) irr = -0.99;
    }
    const irrPct = Math.round(irr * 1000) / 10;
    const coverageRatio = Math.round((margenAnual / capital) * 100 * 10) / 10;
    const viable = irrPct > 8 && paybackYears < horizon && margenMensual > 0;

    setSimResults({
      show: true,
      tir: irrPct.toFixed(1) + "%",
      payback: paybackYears.toFixed(1) + " años",
      flujo: formatCOP(flujoNeto1),
      viable,
      coverageRatio: coverageRatio + "%",
    });

    setIsSimulating(false);
    setTimeout(() => {
      document
        .getElementById("simResults")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  const currentMetric = [
    { tir: "12.5%", m1: "18.4%", m2: "14.2%" },
    { tir: "13.1%", m1: "19.0%", m2: "14.8%" },
    { tir: "11.9%", m1: "17.7%", m2: "13.6%" },
    { tir: "14.2%", m1: "20.1%", m2: "15.3%" },
  ][heroIdx];

  const addRef = (el: Element | null) => {
    if (el && !observerRefs.current.includes(el)) {
      observerRefs.current.push(el);
    }
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleMenu = () => setIsMenuOpen((p) => !p);

  return (
    <>
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      <nav id="navbar" className={isScrolled ? "scrolled" : ""}>
        <div className="nav-inner">
          <a href="#" className="logo">
            <div className="logo-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 10L5.5 6.5L8 8.5L12 4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="logo-text">FinLab</span>
          </a>
          <ul className="nav-links">
            <li>
              <a href="#simulator-section" onClick={(e) => scrollToSection(e, "simulator-section")}>
                Simulador
              </a>
            </li>
            <li>
              <a href="#financing" onClick={(e) => scrollToSection(e, "financing")}>
                Financiamiento
              </a>
            </li>
            <li>
              <a href="#projections" onClick={(e) => scrollToSection(e, "projections")}>
                Proyecciones
              </a>
            </li>
            <li>
              <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
                Nosotros
              </a>
            </li>
          </ul>
          <button
            className="btn-nav"
            onClick={(e) => scrollToSection(e, "simulator-section")}
          >
            Comenzar gratis
          </button>
          <button
            className="hamburger"
            aria-label="Menú"
            onClick={toggleMenu}
          >
            <span
              style={
                isMenuOpen
                  ? { transform: "rotate(45deg) translate(5px,5px)" }
                  : {}
              }
            ></span>
            <span style={isMenuOpen ? { opacity: "0" } : {}}></span>
            <span
              style={
                isMenuOpen
                  ? { transform: "rotate(-45deg) translate(5px,-5px)" }
                  : {}
              }
            ></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`} id="mobileMenu">
        <a href="#simulator-section" onClick={(e) => scrollToSection(e, "simulator-section")}>Simulador</a>
        <a href="#financing" onClick={(e) => scrollToSection(e, "financing")}>Financiamiento</a>
        <a href="#projections" onClick={(e) => scrollToSection(e, "projections")}>Proyecciones</a>
        <a href="#about" onClick={(e) => scrollToSection(e, "about")}>Nosotros</a>
        <a href="#simulator-section" className="btn-mobile" onClick={(e) => scrollToSection(e, "simulator-section")}>
          Comenzar gratis →
        </a>
      </div>

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
              <button
                className="btn-primary"
                onClick={(e) => scrollToSection(e, "simulator-section")}
              >
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
              </button>
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
                  <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span>
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
                  <circle
                    cx="10"
                    cy="10"
                    r="7.5"
                    stroke="#00D084"
                    strokeWidth="1.4"
                  />
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
                onChange={(e) => setSector(e.target.value)}
              >
                <option value="tech">Tecnología / SaaS</option>
                <option value="retail">Retail / Comercio</option>
                <option value="food">Alimentos y Bebidas</option>
                <option value="services">Servicios Profesionales</option>
                <option value="manufacturing">Manufactura</option>
                <option value="other">Otro</option>
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
                    step="1"
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value))}
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
                    min="5"
                    max="80"
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
                disabled={isSimulating}
              >
                {isSimulating ? (
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
          <div
            className={`sim-results ${simResults.show ? "show" : ""}`}
            id="simResults"
          >
            <div className="results-title">📊 Resultados de tu simulación</div>
            <div className="results-grid">
              <div className="result-box">
                <div className="result-box-label">TIR Proyectada</div>
                <div className="result-box-val val-green">{simResults.tir || "—"}</div>
              </div>
              <div className="result-box">
                <div className="result-box-label">Payback</div>
                <div className="result-box-val val-white">
                  {simResults.payback || "—"}
                </div>
              </div>
              <div className="result-box">
                <div className="result-box-label">Flujo Neto (año 1)</div>
                <div className="result-box-val val-green">
                  {simResults.flujo || "—"}
                </div>
              </div>
            </div>
            {simResults.show && (
              <div>
                {simResults.viable ? (
                  <div className="viability-result" style={{ marginTop: "16px" }}>
                    <span className="vr-label">✓ Cobertura de Deuda — Viable</span>
                    <span className="vr-val">{simResults.coverageRatio}</span>
                  </div>
                ) : (
                  <div className="viability-warning" style={{ marginTop: "16px" }}>
                    <span className="vr-warning-label">
                      ⚠ Revisar estructura financiera
                    </span>
                    <span className="vr-warning-val">
                      Cobertura: {simResults.coverageRatio}
                    </span>
                  </div>
                )}
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

      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="logo">
                <div className="logo-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 10L5.5 6.5L8 8.5L12 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="logo-text">FinLab</span>
              </a>
              <p>
                Simulamos el futuro financiero de tu negocio para que crezcas con
                confianza y datos reales.
              </p>
              <div className="footer-social">
                <div className="social-btn" title="LinkedIn">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </div>
                <div className="social-btn" title="Twitter / X">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div className="social-btn" title="Facebook">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="footer-col">
              <h4>Producto</h4>
              <ul>
                <li>
                  <a href="#simulator-section">Simulador</a>
                </li>
                <li>
                  <a href="#projections">Proyecciones</a>
                </li>
                <li>
                  <a href="#financing">Financiamiento</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <ul>
                <li>
                  <a href="#about">Nosotros</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Carreras</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Ayuda</h4>
              <ul>
                <li>
                  <a href="#">Contacto</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">Soporte</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">
              © 2026 FinLab. Todos los derechos reservados.
            </p>
            <div className="footer-legal">
              <a href="#">Términos y condiciones</a>
              <a href="#">Política de privacidad</a>
            </div>
          </div>
        </div>
      </footer>

      <button
        className={`back-top ${showBackTop ? "show" : ""}`}
        id="backTop"
        aria-label="Volver arriba"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 12V4M4 8l4-4 4 4"
            stroke="white"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}
