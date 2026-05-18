"use client";

import { useState, useRef } from "react";
import {
  FINANCING_OPTIONS,
  type FinancingOption,
} from "@/lib/constants/financing-options";
import { useScrollObserver } from "./useScrollObserver";

const MAX_SELECTION = 3;
const COP_LOCALE = "es-CO";
const CURRENCY_PREFIX = "$";
const DELAY_CLASSES = ["", "delay-1", "delay-2", "delay-3"];

const TYPE_LABELS: Record<FinancingOption["type"], string> = {
  deuda: "Deuda",
  equity: "Equity",
  crowdfunding: "Crowdfunding",
  capital_semilla: "Capital semilla",
};

const COMPARE_ROWS: Array<{
  label: string;
  render: (opt: FinancingOption) => React.ReactNode;
}> = [
  { label: "Costo de capital", render: (opt) => opt.capitalCost },
  {
    label: "Monto mínimo",
    render: (opt) =>
      CURRENCY_PREFIX + Math.round(opt.minAmount).toLocaleString(COP_LOCALE),
  },
  {
    label: "Monto máximo",
    render: (opt) =>
      CURRENCY_PREFIX + Math.round(opt.maxAmount).toLocaleString(COP_LOCALE),
  },
  { label: "Pago / flujo", render: (opt) => opt.paymentFlow },
  {
    label: "Pros",
    render: (opt) => (
      <ul className="comparison-list">
        {opt.pros.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  },
  {
    label: "Contras",
    render: (opt) => (
      <ul className="comparison-list">
        {opt.cons.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  },
  {
    label: "Requisitos",
    render: (opt) => (
      <ul className="comparison-list">
        {opt.requirements.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  },
];

export function FinancingSection() {
  const addRef = useScrollObserver();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  };

  const toggleSelection = (id: string) => {
    const option = FINANCING_OPTIONS.find((o) => o.id === id);
    if (!option) return;

    // Determine toast message synchronously (read current selectedIds from closure, not updater prev)
    const isCurrentlySelected = selectedIds.includes(id);

    if (!isCurrentlySelected && selectedIds.length > 0) {
      const existingCategory = FINANCING_OPTIONS.find((o) => o.id === selectedIds[0])?.type;
      if (existingCategory && option.type !== existingCategory) {
        showToast(
          `Solo puedes comparar opciones del mismo tipo (${TYPE_LABELS[existingCategory]}). Se ha reiniciado la selección.`,
        );
        setSelectedIds([id]);
        return;
      }
      if (selectedIds.length >= MAX_SELECTION) {
        showToast(`Máximo ${MAX_SELECTION} opciones a la vez.`);
        return;
      }
    }

    // Pure state update — no side effects here
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  const clearSelection = () => setSelectedIds([]);

  const selectedOptions = FINANCING_OPTIONS.filter((option) =>
    selectedIds.includes(option.id),
  );

  const formatCOP = (value: number) =>
    CURRENCY_PREFIX + Math.round(value).toLocaleString(COP_LOCALE);

  const renderList = (items: string[]) => (
    <ul className="comparison-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );

  // Keep renderList in scope for any legacy use; COMPARE_ROWS uses inline renders
  void renderList;

  return (
    <section className="features-bg" id="financing">
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,.15)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: "0 4px 24px rgba(0,0,0,.5)",
            maxWidth: "420px",
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
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

        <div className="financing-grid">
          {FINANCING_OPTIONS.map((option, index) => {
            const isSelected = selectedIds.includes(option.id);

            const categoryMismatch =
              selectedIds.length > 0 &&
              !isSelected &&
              FINANCING_OPTIONS.find((o) => o.id === selectedIds[0])?.type !==
                option.type;

            const isDisabled =
              (selectedIds.length >= MAX_SELECTION && !isSelected) ||
              categoryMismatch;

            const delayClass = DELAY_CLASSES[index % DELAY_CLASSES.length];
            const cardClassName = [
              "feat-card",
              "financing-card",
              "animate-on-scroll",
              delayClass,
              isSelected ? "selected" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={option.id} className={cardClassName} ref={addRef}>
                <div className="financing-card-head">
                  <div>
                    <div className="feat-title">{option.name}</div>
                    <div className="financing-type">{TYPE_LABELS[option.type]}</div>
                  </div>
                  <label className="financing-toggle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleSelection(option.id)}
                    />
                    <span>{isSelected ? "Seleccionado" : "Comparar"}</span>
                  </label>
                </div>
                <div className="financing-meta">
                  <div>
                    <div className="financing-label">Costo de capital</div>
                    <div className="financing-value">{option.capitalCost}</div>
                  </div>
                  <div>
                    <div className="financing-label">Monto</div>
                    <div className="financing-value">
                      {formatCOP(option.minAmount)} - {formatCOP(option.maxAmount)}
                    </div>
                  </div>
                </div>
                <p className="feat-desc">{option.paymentFlow}</p>
              </div>
            );
          })}
        </div>

        {selectedOptions.length >= 2 && (
          <div className="financing-compare">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div className="financing-compare-title">
                Comparador de alternativas
              </div>
              <button
                onClick={clearSelection}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,.2)",
                  color: "#aaa",
                  borderRadius: "8px",
                  padding: "6px 14px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                ✕ Cerrar
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  minWidth: "500px",
                }}
              >
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid rgba(255,255,255,.1)" }}
                  >
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        color: "#777",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "11px",
                        letterSpacing: ".06em",
                        width: "140px",
                      }}
                    ></th>
                    {selectedOptions.map((opt) => (
                      <th
                        key={opt.id}
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        {opt.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr
                      key={row.label}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,.05)",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          color: "#777",
                          fontWeight: 600,
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: ".04em",
                          verticalAlign: "top",
                        }}
                      >
                        {row.label}
                      </td>
                      {selectedOptions.map((opt) => (
                        <td
                          key={opt.id}
                          style={{
                            padding: "12px",
                            color: "#ccc",
                            verticalAlign: "top",
                          }}
                        >
                          {row.render(opt)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
