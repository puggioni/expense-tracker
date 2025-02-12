import { IsString, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateCardExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  installmentAmount: number;

  @IsNumber()
  @Min(1)
  installments: number;

  @IsBoolean()
  isRecurring: boolean;

  @IsString()
  firstPaymentDate: string;

  @IsBoolean()
  isUSD: boolean;
}
