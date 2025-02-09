import { IsString, IsNumber, IsEnum, Min, Max, Length } from 'class-validator';
import { CardColor } from '../constants/card-color.enum';

export class CreateCardDto {
  @IsString()
  name: string;

  @IsString()
  bank: string;

  @IsNumber()
  @Min(0)
  creditLimit: number;

  @IsEnum(CardColor)
  color: CardColor;

  @IsString()
  @Length(4, 4)
  lastFourDigits: string;

  @IsNumber()
  @Min(1)
  @Max(31)
  closingDay: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  dueDay: number;
}
