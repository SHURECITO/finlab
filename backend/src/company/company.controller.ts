import { Controller, Post, Get, Patch, Put, Param, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateCompanyDto, @Request() req: { user: { id: string } }) {
    return this.companyService.create(dto, req.user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req: { user: { id: string } }) {
    return this.companyService.findByUser(req.user.id);
  }

  @Get('public')
  findPublic() {
    return this.companyService.findPublic();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.companyService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @Request() req: { user: { id: string } }) {
    return this.companyService.update(id, dto, req.user.id);
  }

  @Put('my/financial-profile')
  @UseGuards(JwtAuthGuard)
  async setFinancialProfile(
    @Body() body: {
      activos?: number;
      ingresosMensuales?: number;
      gastosMensuales?: number;
      sectorEconomico?: string;
      skip?: boolean;
    },
    @Request() req: { user: { id: string } },
  ) {
    if (body.skip) {
      await this.companyService.clearFinancialProfile(req.user.id);
      return { success: true, hasFinancialProfile: false };
    }
    if (!body.activos || !body.ingresosMensuales || !body.gastosMensuales || !body.sectorEconomico) {
      throw new BadRequestException(
        'Para guardar tu perfil financiero debes proporcionar los 4 datos: activos, ingresos, gastos y sector. Si no tienes alguno, marca "No cuento con estos datos" y continúa.',
      );
    }
    await this.companyService.setFinancialProfile(req.user.id, {
      activos: body.activos,
      ingresosMensuales: body.ingresosMensuales,
      gastosMensuales: body.gastosMensuales,
      sectorEconomico: body.sectorEconomico,
    });
    return { success: true, hasFinancialProfile: true };
  }
}
