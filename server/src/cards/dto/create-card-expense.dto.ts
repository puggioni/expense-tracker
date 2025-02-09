import { IsString, IsNumber, IsBoolean, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

  @Type(() => Date)
  @IsDate()
  firstPaymentDate: Date;
}
