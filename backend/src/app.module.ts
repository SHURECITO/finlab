import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { SimulationModule } from './simulation/simulation.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { CreditComparisonModule } from './credit-comparison/credit-comparison.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI') ?? '',
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    SimulationModule,
    AuthModule,
    CompanyModule,
    CreditComparisonModule,
  ],
})
export class AppModule {}
