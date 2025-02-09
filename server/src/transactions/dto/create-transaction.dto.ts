import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDate,
  Min,
} from 'class-validator';
import { CategoryType } from 'src/categories/entities/category.entity';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  fromAccountId: string;

  @IsUUID()
  @IsOptional()
  toAccountId?: string;
}
