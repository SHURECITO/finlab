"use client";

const SAMPLE_ROWS = [
  { entidad: "Lulo Bank", tasa: "20.50%", cuota: "$742.000", total: "$26.7M", semaforo: "verde" as const, best: true },
  { entidad: "Bancolombia", tasa: "24.80%", cuota: "$831.000", total: "$29.9M", semaforo: "amarillo" as const, best: false },
  { entidad: "BBVA", tasa: "27.10%", cuota: "$882.000", total: "$31.7M", semaforo: "rojo" as const, best: false },
];

const SEMAFORO_COLOR: Record<"verde" | "amarillo" | "rojo", string> = {
  verde: "#00D084",
  amarillo: "#FBBF24",
  rojo: "#EF4444",
};

function MockTable() {
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: "16px",
        overflow: "hidden",
        fontSize: "13px",
        userSelect: "none",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr 60px",
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          color: "#555",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        <span>Entidad</span>
        <span>Tasa EA</span>
        <span>Cuota/mes</span>
        <span>Total pagado</span>
        <span>Estado</span>
      </div>

      {/* Data rows */}
      {SAMPLE_ROWS.map((row) => (
        <div
          key={row.entidad}
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 60px",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,.05)",
            alignItems: "center",
            background: row.best ? "rgba(0,208,132,.05)" : "transparent",
            borderLeft: row.best ? "3px solid #00D084" : "3px solid transparent",
          }}
        >
          <span style={{ fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            {row.entidad}
            {row.best && (
              <span
                style={{
                  background: "#00D084",
                  color: "#000",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "100px",
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                }}
              >
                Mejor opción
              </span>
            )}
          </span>
          <span style={{ color: SEMAFORO_COLOR[row.semaforo] }}>{row.tasa}</span>
          <span style={{ color: "#ccc" }}>{row.cuota}</span>
          <span style={{ color: "#ccc" }}>{row.total}</span>
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: SEMAFORO_COLOR[row.semaforo],
              display: "inline-block",
              boxShadow: `0 0 8px ${SEMAFORO_COLOR[row.semaforo]}66`,
            }}
          />
        </div>
      ))}

      {/* Blurred overlay hint */}
      <div
        style={{
          padding: "12px 20px",
          textAlign: "center",
          color: "#444",
          fontSize: "12px",
          fontStyle: "italic",
        }}
      >
        + 3 entidades más disponibles al registrarse...
      </div>
    </div>
  );
}

export function CtaComparadorSection() {
  return (
    <section
      id="comparador-cta"
      style={{
        background: "#0A0A0A",
        padding: "100px 24px",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: "16px",
              lineHeight: 1.15,
            }}
          >
            Compara tus opciones de financiamiento
            <br />
            <span style={{ color: "#00D084" }}>en minutos</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "#888",
              lineHeight: 1.7,
              maxWidth: "580px",
              margin: "0 auto",
            }}
          >
            Crea tu cuenta gratis y accede al Comparador de Alternativas de Financiamiento.
            Compara créditos, capital semilla, crowdfunding y más, todo en un solo lugar.
          </p>
        </div>

        {/* Mockup table */}
        <div style={{ marginBottom: "48px", position: "relative" }}>
          <MockTable />
          {/* Blur mask at bottom to hint at more content */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60px",
              background: "linear-gradient(to bottom, transparent, #0A0A0A)",
              borderRadius: "0 0 16px 16px",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <a
            href="/auth/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#00D084",
              color: "#000",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              padding: "16px 36px",
              borderRadius: "100px",
              textDecoration: "none",
              transition: "opacity .2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
          >
            Crear cuenta gratis →
          </a>

          <p style={{ fontSize: "14px", color: "#666" }}>
            ¿Ya tienes cuenta?{" "}
            <a href="/auth/login" style={{ color: "#00D084", textDecoration: "none", fontWeight: 600 }}>
              Inicia sesión
            </a>
          </p>

          <p style={{ fontSize: "12px", color: "#444", marginTop: "4px" }}>
            Sin tarjeta de crédito · Datos seguros · Tasas actualizadas diariamente
          </p>
        </div>
      </div>
    </section>
  );
}
