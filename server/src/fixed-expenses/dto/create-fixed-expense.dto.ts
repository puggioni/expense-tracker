import {
  IsString,
  IsNumber,
  IsUUID,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateFixedExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  previousExpenseId?: string;
}
