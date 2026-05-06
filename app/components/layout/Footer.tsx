export function Footer() {
  return (
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
          <p className="footer-copy">© 2026 FinLab. Todos los derechos reservados.</p>
          <div className="footer-legal">
            <a href="#">Términos y condiciones</a>
            <a href="#">Política de privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
