/**
 * Formats a number as Colombian peso: $1.234.567
 * (dot as thousand separator, no decimal for round values)
 */
export function formatCOP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CO').replace(/,/g, '.');
}

/**
 * Formats a percentage: 25.34%
 */
export function formatPct(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a date as dd/mm/yyyy
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO');
}

/**
 * Semaforo color tokens matching the existing design system
 */
export const SEMAFORO_COLORS = {
  verde: { bg: 'rgba(0,208,132,0.12)', text: '#00D084', label: 'Favorable' },
  amarillo: { bg: 'rgba(255,184,0,0.12)', text: '#FFB800', label: 'Aceptable' },
  rojo: { bg: 'rgba(255,68,68,0.12)', text: '#FF4444', label: 'Costoso' },
} as const;
