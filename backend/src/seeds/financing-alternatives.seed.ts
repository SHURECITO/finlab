import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI ?? '';
if (!MONGODB_URI) throw new Error('MONGODB_URI not set');

const AlternativeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    descripcion: { type: String, required: true },
    costoDescripcion: { type: String, required: true },
    montoMinimo: { type: Number, required: true },
    montoMaximo: { type: Number, required: true },
    plazoEjecucionMeses: { type: Number },
    requisitos: [String],
    ventajas: [String],
    desventajas: [String],
    applyUrl: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    sourceUrl: { type: String, required: true },
    stale: { type: Boolean, default: false },
  },
  { collection: 'financingAlternatives', timestamps: true },
);

const Alternative = mongoose.model('FinancingAlternative', AlternativeSchema);

const ALTERNATIVES = [
  {
    code: 'sena_fondo_emprender',
    name: 'Fondo Emprender SENA',
    category: 'capital_semilla',
    descripcion: 'Capital semilla no reembolsable para emprendedores con formación SENA. Financia proyectos productivos viables con acompañamiento técnico.',
    costoDescripcion: '0% — capital condonable si se cumplen los indicadores de generación de empleo y ventas.',
    montoMinimo: 10000000,
    montoMaximo: 180000000,
    plazoEjecucionMeses: 24,
    requisitos: [
      'Ser aprendiz SENA activo o egresado',
      'Plan de negocio aprobado por evaluadores',
      'Formalización jurídica del emprendimiento',
      'Registro en plataforma Fondo Emprender',
    ],
    ventajas: [
      'Capital no reembolsable si se cumplen metas',
      'Acompañamiento técnico del SENA',
      'Sin necesidad de historial crediticio',
    ],
    desventajas: [
      'Solo para aprendices/egresados SENA',
      'Alta competencia en convocatorias',
      'Desembolsos condicionados a hitos',
    ],
    applyUrl: 'https://www.fondoemprender.com/',
    sourceUrl: 'https://www.fondoemprender.com/',
  },
  {
    code: 'a2censo',
    name: 'Crowdfunding a2censo (BVC)',
    category: 'crowdfunding',
    descripcion: 'Plataforma de crowdfunding de deuda regulada por la BVC. Empresas publican su campaña y múltiples inversionistas financian a tasas acordadas.',
    costoDescripcion: 'Tasa definida en campaña + comisión plataforma (~3-5%). Variable según perfil de riesgo.',
    montoMinimo: 50000000,
    montoMaximo: 2000000000,
    requisitos: [
      'Empresa con al menos 2 años de operación',
      'Estados financieros certificados',
      'RUT y cámara de comercio al día',
      'Calificación de riesgo por a2censo',
    ],
    ventajas: [
      'Acceso a múltiples inversionistas en una sola campaña',
      'Proceso digital y transparente',
      'Construye visibilidad de marca',
    ],
    desventajas: [
      'Requiere campaña de comunicación fuerte',
      'Comisiones de plataforma y colocación',
      'Si no se alcanza la meta, no se desembolsa',
    ],
    applyUrl: 'https://a2censo.com/',
    sourceUrl: 'https://a2censo.com/',
  },
  {
    code: 'innpulsa_capital_semilla',
    name: 'Capital Semilla iNNpulsa',
    category: 'capital_semilla',
    descripcion: 'Financiamiento no reembolsable para startups y emprendimientos innovadores con potencial de crecimiento. Convocatorias periódicas del MinCIT.',
    costoDescripcion: '0% — no reembolsable, condicionado a hitos de innovación y crecimiento.',
    montoMinimo: 50000000,
    montoMaximo: 200000000,
    plazoEjecucionMeses: 18,
    requisitos: [
      'Proyecto con componente de innovación demostrable',
      'Equipo emprendedor con experiencia en el sector',
      'Plan de negocio con métricas de impacto',
      'Empresa formalizada o en proceso',
    ],
    ventajas: [
      'Capital no reembolsable',
      'Acompañamiento técnico especializado',
      'Red de contactos y visibilidad institucional',
    ],
    desventajas: [
      'Alta competencia y criterios de selección exigentes',
      'Procesos de evaluación extensos (3-6 meses)',
      'Convocatorias con cupos limitados',
    ],
    applyUrl: 'https://www.innpulsa.gov.co/',
    sourceUrl: 'https://www.innpulsa.gov.co/',
  },
  {
    code: 'angel_equity',
    name: 'Inversionista Ángel / Equity',
    category: 'equity',
    descripcion: 'Financiamiento a cambio de participación accionaria. Un inversionista ángel aporta capital y mentoría estratégica a cambio de un porcentaje del negocio.',
    costoDescripcion: 'Entre 10% y 30% de participación accionaria según valuación y acuerdo.',
    montoMinimo: 50000000,
    montoMaximo: 1000000000,
    requisitos: [
      'Modelo de negocio escalable con métricas de tracción',
      'Equipo fundador sólido y comprometido',
      'Proyección de retorno atractiva para el inversionista',
      'Due diligence legal y financiero al día',
    ],
    ventajas: [
      'Capital + mentoría estratégica del inversionista',
      'Red de contactos e influencia sectorial',
      'Flexibilidad en uso de los recursos',
    ],
    desventajas: [
      'Dilución de participación accionaria',
      'Expectativa de alto crecimiento y salida futura',
      'Proceso de negociación complejo y lento',
    ],
    applyUrl: 'https://www.rednacionaldeangeles.com/',
    sourceUrl: 'https://www.rednacionaldeangeles.com/',
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const alt of ALTERNATIVES) {
    await Alternative.findOneAndUpdate(
      { code: alt.code },
      { $set: alt },
      { upsert: true, new: true },
    );
    console.log(`[alternative] ${alt.code} — ${alt.name}`);
  }

  console.log('Alternatives seed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
