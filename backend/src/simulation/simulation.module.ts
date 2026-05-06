import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './services/simulation.service';
import { FinancialCalculatorService } from './services/financial-calculator.service';
import { Simulation, SimulationSchema } from './schemas/simulation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Simulation.name, schema: SimulationSchema },
    ]),
  ],
  controllers: [SimulationController],
  providers: [SimulationService, FinancialCalculatorService],
})
export class SimulationModule {}
