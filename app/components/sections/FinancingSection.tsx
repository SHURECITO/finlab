"use client";

import { useState } from "react";
import {
  FINANCING_OPTIONS,
  type FinancingOption,
} from "@/lib/constants/financing-options";
import { useScrollObserver } from "./useScrollObserver";

const MAX_SELECTION = 2;
const COP_LOCALE = "es-CO";
const CURRENCY_PREFIX = "$";
const DELAY_CLASSES = ["", "delay-1", "delay-2", "delay-3"];

const TYPE_LABELS: Record<FinancingOption["type"], string> = {
  deuda: "Deuda",
  equity: "Equity",
  crowdfunding: "Crowdfunding",
  capital_semilla: "Capital semilla",
};

export function FinancingSection() {
  const addRef = useScrollObserver();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= MAX_SELECTION) {
        return prev;
      }
      return [...prev, id];
    });
  };

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

  return (
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

        <div className="financing-grid">
          {FINANCING_OPTIONS.map((option, index) => {
            const isSelected = selectedIds.includes(option.id);
            const isDisabled = selectedIds.length >= MAX_SELECTION && !isSelected;
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

        {selectedOptions.length === MAX_SELECTION && (
          <div className="financing-compare animate-on-scroll" ref={addRef}>
            <div className="financing-compare-title">
              Comparador de alternativas
            </div>
            <div className="comparison-table">
              <div className="comparison-row comparison-head">
                <div></div>
                <div>{selectedOptions[0].name}</div>
                <div>{selectedOptions[1].name}</div>
              </div>
              <div className="comparison-row">
                <div className="comparison-label">Costo de capital</div>
                <div className="comparison-value">{selectedOptions[0].capitalCost}</div>
                <div className="comparison-value">{selectedOptions[1].capitalCost}</div>
              </div>
              <div className="comparison-row">
                <div className="comparison-label">Monto mínimo</div>
                <div className="comparison-value">
                  {formatCOP(selectedOptions[0].minAmount)}
                </div>
                <div className="comparison-value">
                  {formatCOP(selectedOptions[1].minAmount)}
                </div>
              </div>
              <div className="comparison-row">
                <div className="comparison-label">Monto máximo</div>
                <div className="comparison-value">
                  {formatCOP(selectedOptions[0].maxAmount)}
                </div>
                <div className="comparison-value">
                  {formatCOP(selectedOptions[1].maxAmount)}
                </div>
              </div>
              <div className="comparison-row">
                <div className="comparison-label">Pros</div>
                <div className="comparison-value">
                  {renderList(selectedOptions[0].pros)}
                </div>
                <div className="comparison-value">
                  {renderList(selectedOptions[1].pros)}
                </div>
              </div>
              <div className="comparison-row">
                <div className="comparison-label">Contras</div>
                <div className="comparison-value">
                  {renderList(selectedOptions[0].cons)}
                </div>
                <div className="comparison-value">
                  {renderList(selectedOptions[1].cons)}
                </div>
              </div>
              <div className="comparison-row">
                <div className="comparison-label">Requisitos</div>
                <div className="comparison-value">
                  {renderList(selectedOptions[0].requirements)}
                </div>
                <div className="comparison-value">
                  {renderList(selectedOptions[1].requirements)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
