"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";

const SCROLL_TOP_THRESHOLD = 40;
const BACK_TOP_THRESHOLD = 400;

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('finlab_token'));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setScrollProgress((window.scrollY / scrollHeight) * 100);
      }
      setIsScrolled(window.scrollY > SCROLL_TOP_THRESHOLD);
      setShowBackTop(window.scrollY > BACK_TOP_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (event: MouseEvent<HTMLElement>, id: string) => {
    event.preventDefault();
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

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
              <a
                href="#comparador-cta"
                onClick={(e) => scrollToSection(e, "comparador-cta")}
              >
                Comparar
              </a>
            </li>
            <li>
              <a href="#financing" onClick={(e) => scrollToSection(e, "financing")}>
                Financiamiento
              </a>
            </li>
            <li>
              <a
                href="#projections"
                onClick={(e) => scrollToSection(e, "projections")}
              >
                Proyecciones
              </a>
            </li>
            <li>
              <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
                Nosotros
              </a>
            </li>
            <li>
              <Link href="/investors">Para Inversionistas</Link>
            </li>
          </ul>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-nav">
              Mi Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="btn-nav">
              Iniciar sesión
            </Link>
          )}
          <button className="hamburger" aria-label="Menú" onClick={toggleMenu}>
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
        <a
          href="#comparador-cta"
          onClick={(e) => scrollToSection(e, "comparador-cta")}
        >
          Comparar
        </a>
        <a href="#financing" onClick={(e) => scrollToSection(e, "financing")}>
          Financiamiento
        </a>
        <a
          href="#projections"
          onClick={(e) => scrollToSection(e, "projections")}
        >
          Proyecciones
        </a>
        <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
          Nosotros
        </a>
        <Link href="/investors">Para Inversionistas</Link>
        {isLoggedIn ? (
          <Link href="/dashboard" className="btn-mobile">
            Mi Dashboard →
          </Link>
        ) : (
          <Link href="/auth/login" className="btn-mobile">
            Iniciar sesión →
          </Link>
        )}
      </div>

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
