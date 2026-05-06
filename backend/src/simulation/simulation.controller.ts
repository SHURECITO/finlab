import { Body, Controller, Post } from '@nestjs/common';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { SimulationService } from './services/simulation.service';

@Controller('simulations')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post()
  create(@Body() dto: CreateSimulationDto) {
    return this.simulationService.createSimulation(dto);
  }
}
