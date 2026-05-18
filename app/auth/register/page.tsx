"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import { setToken } from "@/lib/auth";

type SectorValue =
  | "tecnologia"
  | "retail"
  | "alimentos"
  | "servicios"
  | "manufactura"
  | "otro";

export default function RegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sector, setSector] = useState<SectorValue>("tecnologia");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await register({ email, password, businessName, sector, city });
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la cuenta. Intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#fff",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    fontFamily: "'Sora', sans-serif",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#aaa",
    fontSize: "13px",
    marginBottom: "6px",
    fontFamily: "'Sora', sans-serif",
  };

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "32px",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "24px" }}>📊</span>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "22px",
              fontWeight: 800,
              color: "#00FF87",
              letterSpacing: "-0.02em",
            }}
          >
            FinLab
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "24px",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          Crea tu cuenta
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#888",
            textAlign: "center",
            margin: "0 0 32px",
            lineHeight: "1.5",
          }}
        >
          Empieza a simular tu empresa gratis
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(255,59,48,.1)",
              border: "1px solid rgba(255,59,48,.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#ff3b30",
              fontSize: "13px",
              marginBottom: "20px",
              lineHeight: "1.5",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label htmlFor="businessName" style={labelStyle}>
              Nombre de la empresa
            </label>
            <input
              id="businessName"
              type="text"
              required
              placeholder="Mi Empresa S.A.S."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={inputStyle}
              autoComplete="organization"
            />
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="sector" style={labelStyle}>
              Sector
            </label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorValue)}
              style={{
                ...inputStyle,
                appearance: "none",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                paddingRight: "36px",
                cursor: "pointer",
              }}
            >
              <option value="tecnologia">Tecnología / SaaS</option>
              <option value="retail">Retail / Comercio</option>
              <option value="alimentos">Alimentos y Bebidas</option>
              <option value="servicios">Servicios Profesionales</option>
              <option value="manufactura">Manufactura</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="city" style={labelStyle}>
              Ciudad
            </label>
            <input
              id="city"
              type="text"
              placeholder="Bogotá, Medellín, Cali..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={inputStyle}
              autoComplete="address-level2"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: isLoading ? "rgba(0,255,135,.5)" : "#00FF87",
              color: "#000",
              fontWeight: 700,
              fontSize: "15px",
              borderRadius: "10px",
              padding: "14px",
              width: "100%",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "'Sora', sans-serif",
              marginTop: "4px",
              transition: "background .2s",
            }}
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>
        </form>

        {/* Login link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#666",
            margin: "28px 0 0",
          }}
        >
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            style={{
              color: "#00FF87",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
