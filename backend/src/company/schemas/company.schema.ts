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

  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
