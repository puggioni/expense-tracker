import { IsBoolean } from 'class-validator';

export class ToggleFixedExpenseDto {
  @IsBoolean()
  isActive: boolean;
}
