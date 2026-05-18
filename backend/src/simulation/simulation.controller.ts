import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { SimulationService } from './services/simulation.service';

@Controller('simulations')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() dto: CreateSimulationDto, @Request() req) {
    const userId: string | undefined = req.user?.id;
    return this.simulationService.createSimulation(dto, userId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req: { user: { id: string } }, @Query('companyId') companyId?: string) {
    return this.simulationService.findByUser(req.user.id, companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.simulationService.findOne(id);
  }
}
