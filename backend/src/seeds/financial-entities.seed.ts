import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ---------------------------------------------------------------------------
// Schemas (inline — no validators needed for a seed script)
// ---------------------------------------------------------------------------

const financialEntitiesSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['banco', 'fintech'] },
    logoUrl: { type: String, default: '' },
    products: {
      type: [
        {
          productName: String,
          tasaEA: Number,
          tasaType: String,
          montoMinimo: Number,
          montoMaximo: Number,
          plazoMinMeses: Number,
          plazoMaxMeses: Number,
          requisitos: { type: [String], default: [] },
          sourceUrl: String,
          applyUrl: String,
        },
      ],
      default: [],
    },
    stale: { type: Boolean, default: false },
  },
  { collection: 'financialEntities', timestamps: true },
);

const referenceRatesSchema = new mongoose.Schema(
  {
    indicator: {
      type: String,
      required: true,
      unique: true,
      enum: ['IBR_1M', 'IBR_3M', 'IBR_6M', 'IPC_ANUAL'],
    },
    value: { type: Number, required: true },
    unit: { type: String, required: true, enum: ['EA', 'PERCENTAGE'] },
    sourceDate: { type: Date },
  },
  { collection: 'referenceRates', timestamps: true },
);

const FinancialEntityModel = mongoose.model<mongoose.AnyObject>(
  'FinancialEntity',
  financialEntitiesSchema,
);
const ReferenceRateModel = mongoose.model<mongoose.AnyObject>('ReferenceRate', referenceRatesSchema);

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const referenceRates = [
  { indicator: 'IPC_ANUAL', value: 0.0568, unit: 'EA' },
  { indicator: 'IBR_1M', value: 0.1065, unit: 'EA' },
  { indicator: 'IBR_3M', value: 0.1071, unit: 'EA' },
  { indicator: 'IBR_6M', value: 0.1082, unit: 'EA' },
];

const financialEntities = [
  {
    code: 'bancolombia',
    name: 'Bancolombia',
    type: 'banco',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Bancolombia_logo.svg/1200px-Bancolombia_logo.svg.png',
    products: [
      {
        productName: 'Crédito de Libre Inversión',
        tasaEA: 0.25,
        tasaType: 'EA',
        montoMinimo: 1_000_000,
        montoMaximo: 500_000_000,
        plazoMinMeses: 48,
        plazoMaxMeses: 84,
        requisitos: [],
        sourceUrl:
          'https://www.bancolombia.com/personas/prestamos/credito-libre-inversion',
        applyUrl: 'https://www.bancolombia.com/personas/prestamos/libre-inversion',
      },
    ],
    stale: false,
  },
  {
    code: 'bbva',
    name: 'BBVA Colombia',
    type: 'banco',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/BBVA_2019.svg/1200px-BBVA_2019.svg.png',
    products: [
      {
        productName: 'Crédito Vehículo (Tasa Fija)',
        tasaEA: 0.1788,
        tasaType: 'EA',
        montoMinimo: 3_000_000,
        montoMaximo: 200_000_000,
        plazoMinMeses: 12,
        plazoMaxMeses: 84,
        requisitos: [],
        sourceUrl: 'https://www.bbva.com.co/personas/productos/prestamos/vehiculo.html',
        applyUrl: 'https://www.bbva.com.co/personas/prestamos/credito-personal.html',
      },
    ],
    stale: false,
  },
  {
    code: 'banco_bogota',
    name: 'Banco de Bogotá',
    type: 'banco',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Banco_de_Bogot%C3%A1_logo.svg/1200px-Banco_de_Bogot%C3%A1_logo.svg.png',
    products: [
      {
        productName: 'Crédito de Libre Inversión',
        tasaEA: 0.2534,
        tasaType: 'EA',
        montoMinimo: 1_000_000,
        montoMaximo: 500_000_000,
        plazoMinMeses: 24,
        plazoMaxMeses: 72,
        requisitos: [],
        sourceUrl:
          'https://www.bancodebogota.com/personas/creditos/libre-inversion',
        applyUrl: 'https://www.bancodebogota.com/wps/portal/banco-de-bogota/bogota/productos/para-ti/creditos/credito-de-consumo-y-libre-inversion',
      },
    ],
    stale: false,
  },
  {
    code: 'sempli',
    name: 'Sempli',
    type: 'fintech',
    logoUrl: 'https://sempli.co/wp-content/uploads/2022/06/sempli-logo.svg',
    products: [
      {
        productName: 'Crédito a Término (Pymes)',
        tasaEA: 0.2465,
        tasaType: 'EA',
        montoMinimo: 10_000_000,
        montoMaximo: 250_000_000,
        plazoMinMeses: 12,
        plazoMaxMeses: 36,
        requisitos: [
          'Empresa constituida mínimo 1 año',
          'Ventas anuales superiores a $120M COP',
        ],
        sourceUrl: 'https://sempli.co/creditos',
        applyUrl: 'https://www.sempli.co/empresas',
      },
    ],
    stale: false,
  },
  {
    code: 'lulo_bank',
    name: 'Lulo Bank',
    type: 'fintech',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Lulo_Bank_logo.svg/1200px-Lulo_Bank_logo.svg.png',
    products: [
      {
        productName: 'Crédito Libre Inversión',
        tasaEA: 0.2241,
        tasaType: 'EA',
        montoMinimo: 1_000_000,
        montoMaximo: 50_000_000,
        plazoMinMeses: 12,
        plazoMaxMeses: 48,
        requisitos: [],
        sourceUrl: 'https://www.lulobank.com/credito',
        applyUrl: 'https://www.lulobank.com/credito',
      },
    ],
    stale: false,
  },
  {
    code: 'r5',
    name: 'R5',
    type: 'fintech',
    logoUrl: 'https://r5.com.co/wp-content/uploads/2023/01/logo-r5.svg',
    products: [
      {
        productName: 'Crédito Vehículo',
        tasaEA: 0.1816,
        tasaType: 'EA',
        montoMinimo: 5_000_000,
        montoMaximo: 50_000_000,
        plazoMinMeses: 12,
        plazoMaxMeses: 48,
        requisitos: [],
        sourceUrl: 'https://r5.com.co',
        applyUrl: 'https://r5.com.co/solicitar-credito',
      },
    ],
    stale: false,
  },
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Set it in backend/.env or backend/.env.local',
    );
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Upsert reference rates
  for (const rate of referenceRates) {
    const now = new Date();
    await ReferenceRateModel.findOneAndUpdate(
      { indicator: rate.indicator },
      { $set: { ...rate, sourceDate: now, updatedAt: now } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(
      `[rate] ${rate.indicator} = ${rate.value} (unit: ${rate.unit})`,
    );
  }

  // Upsert financial entities
  for (const entity of financialEntities) {
    const now = new Date();
    await FinancialEntityModel.findOneAndUpdate(
      { code: entity.code },
      { $set: { ...entity, stale: false, updatedAt: now } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(
      `[entity] ${entity.code} — ${entity.name} (${entity.type}) — ${entity.products.length} product(s)`,
    );
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
