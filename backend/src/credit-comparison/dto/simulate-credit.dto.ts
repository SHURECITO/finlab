import { IsNumber, IsPositive, IsIn, Min, Max } from 'class-validator';

export class SimulateCreditDto {
  @IsNumber()
  @IsPositive()
  monto: number;

  @IsNumber()
  @Min(1)
  @Max(120)
  plazoMeses: number;

  @IsIn(['libre_inversion'])
  proposito: string;
}
