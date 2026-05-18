import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { Simulation } from '../schemas/simulation.schema';
import { SimulationResult } from '../types/simulation.types';
import { FinancialCalculatorService } from './financial-calculator.service';

type SimulationDocument = Simulation & { _id: unknown };

@Injectable()
export class SimulationService {
  constructor(
    @InjectModel(Simulation.name)
    private readonly simulationModel: Model<Simulation>,
    private readonly calculator: FinancialCalculatorService,
  ) {}

  async createSimulation(dto: CreateSimulationDto, userId?: string): Promise<SimulationResult> {
    const result = this.calculator.calculate(dto);
    const doc: Record<string, unknown> = {
      input: { ...dto } as Record<string, unknown>,
      result: { ...result } as Record<string, unknown>,
    };
    if (userId) doc.userId = new Types.ObjectId(userId);
    if (dto.companyId) doc.companyId = new Types.ObjectId(dto.companyId);
    await this.simulationModel.create(doc);
    return result;
  }

  async findByUser(userId: string, companyId?: string): Promise<SimulationDocument[]> {
    const filter: Record<string, unknown> = { userId };
    if (companyId) filter.companyId = companyId;
    return this.simulationModel.find(filter).sort({ createdAt: -1 }).exec() as unknown as SimulationDocument[];
  }

  async findOne(id: string): Promise<SimulationDocument> {
    if (!isValidObjectId(id)) throw new NotFoundException('Simulation not found');
    const sim = await this.simulationModel.findById(id).select('-userId -__v').exec();
    if (!sim) throw new NotFoundException('Simulation not found');
    return sim as unknown as SimulationDocument;
  }
}
