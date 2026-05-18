import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FinancingAlternative,
  FinancingAlternativeDocument,
} from '../schemas/financing-alternative.schema';

@Injectable()
export class FinancingAlternativesService {
  constructor(
    @InjectModel(FinancingAlternative.name)
    private readonly model: Model<FinancingAlternativeDocument>,
  ) {}

  async findAll(category?: string): Promise<FinancingAlternativeDocument[]> {
    const filter: Record<string, unknown> = { stale: false };
    if (category) filter.category = category;
    return this.model.find(filter).sort({ montoMinimo: 1 }).exec();
  }
}
