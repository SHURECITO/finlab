export interface EntityInfo {
  code: string;
  name: string;
  type: 'banco' | 'fintech';
  logoUrl: string;
}

export interface AmortizationRow {
  mes: number;
  saldoInicial: number;
  cuota: number;
  interes: number;
  abonoCapital: number;
  saldoFinal: number;
}

export interface PlazoComparison {
  cuota: number;
  totalIntereses: number;
  totalPagado: number;
}

export interface TablasComparativas {
  plazo12: PlazoComparison;
  plazo36: PlazoComparison;
  plazo60: PlazoComparison;
  plazoUsuario: PlazoComparison;
}

export interface CreditResult {
  entidad: EntityInfo;
  elegible: boolean;
  razonNoElegible?: string;
  tasaEA: number;
  tasaMensual: number;
  cuotaMensual: number;
  totalIntereses: number;
  totalPagado: number;
  vpn: number;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  tablaAmortizacion: AmortizationRow[];
  tablasComparativas: TablasComparativas;
  interpretacion: string;
  stale?: boolean;
}

export interface Recomendacion {
  mejorOpcion: string;
  razon: string;
}

export interface SimulationResponse {
  simulationId: string;
  monto: number;
  plazoMeses: number;
  tasaDescuentoMensual: number;
  ipcAnualUsado: number;
  fechaCalculo: string;
  resultados: CreditResult[];
  recomendacion: Recomendacion;
}
