import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { Simulation } from '../schemas/simulation.schema';
import { SimulationResult } from '../types/simulation.types';
import { FinancialCalculatorService } from './financial-calculator.service';

@Injectable()
export class SimulationService {
  constructor(
    @InjectModel(Simulation.name)
    private readonly simulationModel: Model<Simulation>,
    private readonly calculator: FinancialCalculatorService,
  ) {}

  async createSimulation(dto: CreateSimulationDto): Promise<SimulationResult> {
    const result = this.calculator.calculate(dto);
    await this.simulationModel.create({
      input: { ...dto } as Record<string, unknown>,
      result: { ...result } as Record<string, unknown>,
    });
    return result;
  }
}
