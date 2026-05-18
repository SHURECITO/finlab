import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FinancialEntityDocument = HydratedDocument<FinancialEntity>;

export class EntityProduct {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  tasaEA: number;

  @Prop({ required: true, enum: ['EA', 'NAMV'] })
  tasaType: string;

  @Prop({ required: true })
  montoMinimo: number;

  @Prop({ required: true })
  montoMaximo: number;

  @Prop({ required: true })
  plazoMinMeses: number;

  @Prop({ required: true })
  plazoMaxMeses: number;

  @Prop({ type: [String], default: [] })
  requisitos: string[];

  @Prop()
  sourceUrl: string;

  @Prop()
  applyUrl: string;
}

@Schema({ collection: 'financialEntities', timestamps: true })
export class FinancialEntity {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['banco', 'fintech'] })
  type: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ type: [Object], default: [] })
  products: EntityProduct[];

  @Prop({ default: false })
  stale: boolean;

  // updatedAt provided by timestamps: true
}

export const FinancialEntitySchema = SchemaFactory.createForClass(FinancialEntity);
