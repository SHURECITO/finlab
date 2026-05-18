import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinancingAlternativesService } from './services/financing-alternatives.service';

@Controller('financing-alternatives')
export class FinancingAlternativesController {
  constructor(private readonly service: FinancingAlternativesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }
}
