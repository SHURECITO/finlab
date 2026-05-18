import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditComparisonController } from './credit-comparison.controller';
import { CreditComparisonService } from './credit-comparison.service';
import { FinancialEntity, FinancialEntitySchema } from './schemas/financial-entity.schema';
import { ReferenceRate, ReferenceRateSchema } from './schemas/reference-rate.schema';
import { SavedSimulation, SavedSimulationSchema } from './schemas/saved-simulation.schema';
import { RateConverterService } from './services/rate-converter.service';
import { AmortizationService } from './services/amortization.service';
import { NpvService } from './services/npv.service';
import { TrafficLightService } from './services/traffic-light.service';
import { InterpretationService } from './services/interpretation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinancialEntity.name, schema: FinancialEntitySchema },
      { name: ReferenceRate.name, schema: ReferenceRateSchema },
      { name: SavedSimulation.name, schema: SavedSimulationSchema },
    ]),
  ],
  controllers: [CreditComparisonController],
  providers: [
    CreditComparisonService,
    RateConverterService,
    AmortizationService,
    NpvService,
    TrafficLightService,
    InterpretationService,
  ],
  exports: [CreditComparisonService],
})
export class CreditComparisonModule {}
