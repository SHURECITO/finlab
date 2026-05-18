import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinancingAlternativesService } from './services/financing-alternatives.service';

const VALID_CATEGORIES = ['capital_semilla', 'crowdfunding', 'equity'] as const;

@Controller('financing-alternatives')
export class FinancingAlternativesController {
  constructor(private readonly service: FinancingAlternativesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('category') category?: string) {
    if (category && !VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
      throw new BadRequestException(`Categoría inválida: ${category}`);
    }
    return this.service.findAll(category);
  }
}
