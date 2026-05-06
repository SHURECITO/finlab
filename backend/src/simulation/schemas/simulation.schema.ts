import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Simulation extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  input: Record<string, unknown>;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  result: Record<string, unknown>;
}

export const SimulationSchema = SchemaFactory.createForClass(Simulation);
