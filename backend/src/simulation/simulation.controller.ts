import { Body, Controller, Get, Logger, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { SimulationService } from './services/simulation.service';

@Controller('simulations')
export class SimulationController {
  private readonly logger = new Logger(SimulationController.name);

  constructor(private readonly simulationService: SimulationService) {}

  /**
   * @deprecated Use POST /api/credit/simulate instead.
   * This endpoint runs the legacy TIR/payback calculator and will be removed in a future release.
   */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() dto: CreateSimulationDto, @Request() req) {
    this.logger.warn('Deprecated endpoint POST /simulations called. Migrate to POST /api/credit/simulate.');
    const userId: string | undefined = req.user?.id;
    return this.simulationService.createSimulation(dto, userId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req: { user: { id: string } }, @Query('companyId') companyId?: string) {
    return this.simulationService.findByUser(req.user.id, companyId);
  }

  /**
   * @deprecated Use GET /api/credit/simulate/:id instead.
   * This endpoint retrieves legacy TIR/payback simulation results and will be removed in a future release.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.warn(`Deprecated endpoint GET /simulations/${id} called. Migrate to GET /api/credit/simulate/:id.`);
    return this.simulationService.findOne(id);
  }
}
