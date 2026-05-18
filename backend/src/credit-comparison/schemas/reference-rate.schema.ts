import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReferenceRateDocument = HydratedDocument<ReferenceRate>;

@Schema({ collection: 'referenceRates', timestamps: true })
export class ReferenceRate {
  @Prop({
    required: true,
    unique: true,
    enum: ['IBR_1M', 'IBR_3M', 'IBR_6M', 'IPC_ANUAL'],
  })
  indicator: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true, enum: ['EA', 'PERCENTAGE'] })
  unit: string;

  @Prop()
  sourceDate: Date;

  // updatedAt provided by timestamps: true
}

export const ReferenceRateSchema = SchemaFactory.createForClass(ReferenceRate);
