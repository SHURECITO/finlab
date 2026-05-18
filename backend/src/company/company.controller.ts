import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
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
}
