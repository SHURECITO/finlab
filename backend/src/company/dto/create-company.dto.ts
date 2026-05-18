import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Max, Min, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['tecnologia', 'retail', 'alimentos', 'servicios', 'manufactura', 'otro'])
  sector: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(['idea', 'mvp', 'crecimiento', 'consolidacion'])
  stage: string;

  @IsNumber()
  @Min(1900)
  @Max(2030)
  foundedYear: number;

  @IsOptional()
  @IsUrl({}, { message: 'website must be a valid URL' })
  website?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
