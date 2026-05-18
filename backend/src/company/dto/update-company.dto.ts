import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min, IsNotEmpty } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(['tecnologia', 'retail', 'alimentos', 'servicios', 'manufactura', 'otro'])
  sector?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsEnum(['idea', 'mvp', 'crecimiento', 'consolidacion'])
  stage?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2030)
  foundedYear?: number;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
