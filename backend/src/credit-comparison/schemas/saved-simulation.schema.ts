import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type SavedSimulationDocument = HydratedDocument<SavedSimulation>;

@Schema({ collection: 'savedSimulations', timestamps: true })
export class SavedSimulation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  monto: number;

  @Prop({ required: true })
  plazoMeses: number;

  @Prop({ required: true, default: 'libre_inversion' })
  proposito: string;

  @Prop({ type: Object, required: true })
  result: Record<string, unknown>;

  @Prop()
  nombre: string;

  // createdAt/updatedAt from timestamps: true
}

export const SavedSimulationSchema = SchemaFactory.createForClass(SavedSimulation);
