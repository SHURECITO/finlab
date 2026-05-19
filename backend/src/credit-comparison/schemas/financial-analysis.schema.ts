import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FinancialAnalysisDocument = HydratedDocument<FinancialAnalysis>;

@Schema({ collection: 'financialAnalyses', timestamps: true })
export class FinancialAnalysis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SavedSimulation' })
  simulationId?: Types.ObjectId;

  @Prop()
  entityCode?: string;

  @Prop({ type: Object, required: true })
  inputSnapshot: {
    activos: number;
    ingresosMensuales: number;
    gastosMensuales: number;
    sectorEconomico: string;
  };

  @Prop({ type: Object, required: true })
  cashFlowProjection: object;

  @Prop({ required: true })
  vpn: number;

  @Prop({ required: true })
  tir: number;

  @Prop({ required: true })
  wacc: number;

  @Prop({ required: true })
  evaluacion: string;

  @Prop({ required: true })
  explicacion: string;
}

export const FinancialAnalysisSchema = SchemaFactory.createForClass(FinancialAnalysis);
