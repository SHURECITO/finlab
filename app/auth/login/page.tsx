"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await login({ email, password });
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al iniciar sesión. Intenta de nuevo."
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
          Bienvenido de vuelta
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
          Ingresa a tu cuenta para continuar
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
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
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
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Register link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#666",
            marginTop: "28px",
            margin: "28px 0 0",
          }}
        >
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/register"
            style={{
              color: "#00FF87",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Crear cuenta gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
