export interface FinancingOption {
  id: string;
  name: string;
  type: 'deuda' | 'equity' | 'crowdfunding' | 'capital_semilla';
  capitalCost: string;
  minAmount: number;
  maxAmount: number;
  paymentFlow: string;
  pros: string[];
  cons: string[];
  requirements: string[];
  examples: string[];
}

export const FINANCING_OPTIONS: FinancingOption[] = [
  {
    id: 'credito-bancario',
    name: 'Crédito bancario tradicional',
    type: 'deuda',
    capitalCost: 'DTF + 6%',
    minAmount: 20000000,
    maxAmount: 500000000,
    paymentFlow: 'Cuotas mensuales con interés fijo o variable.',
    pros: [
      'Tasas competitivas para empresas formales',
      'Plazos amplios y estructurados',
      'Construye historial crediticio',
    ],
    cons: [
      'Requiere garantías y documentación sólida',
      'Procesos de aprobación largos',
      'Dependencia de historial financiero',
    ],
    requirements: [
      'Estados financieros auditados',
      'Historial crediticio empresarial',
      'Garantías reales o aval',
    ],
    examples: ['Bancóldex', 'Bancolombia', 'Davivienda'],
  },
  {
    id: 'microcredito',
    name: 'Microcrédito',
    type: 'deuda',
    capitalCost: '28% - 45% EA',
    minAmount: 1000000,
    maxAmount: 50000000,
    paymentFlow: 'Pagos semanales o mensuales con cuotas fijas.',
    pros: [
      'Aprobación más rápida que la banca tradicional',
      'Montos accesibles para negocios emergentes',
      'Menos requisitos de garantía',
    ],
    cons: [
      'Tasas de interés más altas',
      'Plazos de pago más cortos',
      'Montos limitados para expansión',
    ],
    requirements: [
      'Registro del negocio y cédula',
      'Flujo de caja básico',
      'Referencias comerciales',
    ],
    examples: ['Banco W', 'Bancamía', 'Fundación WWB Colombia'],
  },
  {
    id: 'capital-semilla-innpulsa',
    name: 'Capital semilla iNNpulsa',
    type: 'capital_semilla',
    capitalCost: '0% (no reembolsable)',
    minAmount: 50000000,
    maxAmount: 200000000,
    paymentFlow: 'Desembolsos por hitos y seguimiento del proyecto.',
    pros: [
      'No requiere devolución del capital',
      'Acompañamiento técnico especializado',
      'Visibilidad institucional para el negocio',
    ],
    cons: [
      'Alta competencia en convocatorias',
      'Procesos de evaluación extensos',
      'Desembolsos condicionados a hitos',
    ],
    requirements: [
      'Proyecto con innovación demostrable',
      'Equipo emprendedor validado',
      'Plan de negocios estructurado',
    ],
    examples: ['iNNpulsa Colombia', 'MinCIT', 'Apps.co'],
  },
  {
    id: 'fondo-emprender',
    name: 'Fondo Emprender SENA',
    type: 'capital_semilla',
    capitalCost: '0% (condonado por cumplimiento)',
    minAmount: 10000000,
    maxAmount: 180000000,
    paymentFlow: 'Desembolso por etapas con seguimiento técnico.',
    pros: [
      'Capital condonable con metas claras',
      'Acompañamiento del SENA',
      'Enfoque en emprendimiento regional',
    ],
    cons: [
      'Requiere cumplimiento estricto de indicadores',
      'Convocatorias con cupos limitados',
      'Procesos administrativos formales',
    ],
    requirements: [
      'Plan de negocios validado por el SENA',
      'Formalización del emprendimiento',
      'Cumplimiento de criterios de convocatoria',
    ],
    examples: ['Fondo Emprender', 'SENA', 'SENNOVA'],
  },
  {
    id: 'crowdfunding-a2censo',
    name: 'Crowdfunding (a2censo)',
    type: 'crowdfunding',
    capitalCost: 'Tasa definida en campaña',
    minAmount: 50000000,
    maxAmount: 2000000000,
    paymentFlow: 'Pago de intereses o retornos según la campaña.',
    pros: [
      'Acceso a múltiples inversionistas',
      'Valida interés del mercado',
      'Proceso digital y transparente',
    ],
    cons: [
      'Comisiones por plataforma y colocación',
      'Requiere campaña de comunicación fuerte',
      'Riesgo de no alcanzar la meta',
    ],
    requirements: [
      'Información financiera y legal al día',
      'Estrategia de comunicación definida',
      'Documentación de la empresa',
    ],
    examples: ['a2censo', 'La Bolsa Social', 'Vaki'],
  },
  {
    id: 'inversion-angel',
    name: 'Inversionista ángel / Equity',
    type: 'equity',
    capitalCost: '15-25% del negocio',
    minAmount: 50000000,
    maxAmount: 1000000000,
    paymentFlow: 'Participación en utilidades y salida futura.',
    pros: [
      'Aporte de capital y mentoría estratégica',
      'Flexibilidad en el uso de recursos',
      'Red de contactos e influencia',
    ],
    cons: [
      'Dilución de participación accionaria',
      'Expectativa de alto crecimiento',
      'Negociaciones complejas',
    ],
    requirements: [
      'Modelo de negocio escalable',
      'Métricas de tracción claras',
      'Equipo fundador sólido',
    ],
    examples: [
      'Red de Ángeles Inversionistas de Colombia',
      'Capitalia',
      'Polymath Ventures',
    ],
  },
];
