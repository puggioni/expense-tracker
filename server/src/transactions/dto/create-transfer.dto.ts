import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateTransferDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsUUID()
  fromAccountId: string;

  @IsNotEmpty()
  @IsUUID()
  toAccountId: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}
