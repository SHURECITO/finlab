import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FinancingAlternativeDocument = HydratedDocument<FinancingAlternative>;

@Schema({ collection: 'financingAlternatives', timestamps: true })
export class FinancingAlternative {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['capital_semilla', 'crowdfunding', 'equity'] })
  category: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  costoDescripcion: string;

  @Prop({ required: true })
  montoMinimo: number;

  @Prop({ required: true })
  montoMaximo: number;

  @Prop()
  plazoEjecucionMeses: number;

  @Prop({ type: [String], default: [] })
  requisitos: string[];

  @Prop({ type: [String], default: [] })
  ventajas: string[];

  @Prop({ type: [String], default: [] })
  desventajas: string[];

  @Prop({ required: true })
  applyUrl: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ required: true })
  sourceUrl: string;

  @Prop({ default: false })
  stale: boolean;
}

export const FinancingAlternativeSchema = SchemaFactory.createForClass(FinancingAlternative);
