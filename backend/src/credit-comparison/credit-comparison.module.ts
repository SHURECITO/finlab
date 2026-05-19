import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditComparisonController } from './credit-comparison.controller';
import { CreditComparisonService } from './credit-comparison.service';
import { FinancialEntity, FinancialEntitySchema } from './schemas/financial-entity.schema';
import { ReferenceRate, ReferenceRateSchema } from './schemas/reference-rate.schema';
import { SavedSimulation, SavedSimulationSchema } from './schemas/saved-simulation.schema';
import { FinancingAlternative, FinancingAlternativeSchema } from './schemas/financing-alternative.schema';
import { FinancialAnalysis, FinancialAnalysisSchema } from './schemas/financial-analysis.schema';
import { RateConverterService } from './services/rate-converter.service';
import { AmortizationService } from './services/amortization.service';
import { NpvService } from './services/npv.service';
import { TrafficLightService } from './services/traffic-light.service';
import { InterpretationService } from './services/interpretation.service';
import { FinancingAlternativesService } from './services/financing-alternatives.service';
import { WaccService } from './services/wacc.service';
import { CashFlowProjectionService } from './services/cash-flow-projection.service';
import { FinancialMetricsService } from './services/financial-metrics.service';
import { FinancingAlternativesController } from './financing-alternatives.controller';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinancialEntity.name, schema: FinancialEntitySchema },
      { name: ReferenceRate.name, schema: ReferenceRateSchema },
      { name: SavedSimulation.name, schema: SavedSimulationSchema },
      { name: FinancingAlternative.name, schema: FinancingAlternativeSchema },
      { name: FinancialAnalysis.name, schema: FinancialAnalysisSchema },
    ]),
    CompanyModule,
  ],
  controllers: [CreditComparisonController, FinancingAlternativesController],
  providers: [
    CreditComparisonService,
    RateConverterService,
    AmortizationService,
    NpvService,
    TrafficLightService,
    InterpretationService,
    FinancingAlternativesService,
    WaccService,
    CashFlowProjectionService,
    FinancialMetricsService,
  ],
  exports: [CreditComparisonService, WaccService],
})
export class CreditComparisonModule {}
