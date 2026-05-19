import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  sector: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  stage: string;

  @Prop({ required: true })
  foundedYear: number;

  @Prop()
  website?: string;

  @Prop({ default: false })
  isPublic: boolean;

  // Financial profile — all 4 must be set together (all-or-nothing rule)
  @Prop({ min: 0 })
  activos?: number;

  @Prop({ min: 0 })
  ingresosMensuales?: number;

  @Prop({ min: 0 })
  gastosMensuales?: number;

  @Prop()
  sectorEconomico?: string;

  @Prop({ default: false })
  hasFinancialProfile: boolean;

  @Prop()
  financialProfileUpdatedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
