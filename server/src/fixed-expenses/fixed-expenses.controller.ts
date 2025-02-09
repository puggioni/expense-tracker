import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Put,
} from '@nestjs/common';
import { FixedExpensesService } from './fixed-expenses.service';
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import { ToggleFixedExpenseDto } from './dto/toggle-fixed-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('fixed-expenses')
@UseGuards(JwtAuthGuard)
export class FixedExpensesController {
  constructor(private readonly fixedExpensesService: FixedExpensesService) {}

  @Post()
  create(
    @Body() createFixedExpenseDto: CreateFixedExpenseDto,
    @GetUser() user: User,
  ) {
    return this.fixedExpensesService.create(createFixedExpenseDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.fixedExpensesService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.fixedExpensesService.findOne(id, user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFixedExpenseDto: UpdateFixedExpenseDto,
    @GetUser() user: User,
  ) {
    return this.fixedExpensesService.update(id, updateFixedExpenseDto, user);
  }

  @Patch(':id/toggle')
  toggle(
    @Param('id') id: string,
    @Body() toggleFixedExpenseDto: ToggleFixedExpenseDto,
    @GetUser() user: User,
  ) {
    return this.fixedExpensesService.toggle(id, toggleFixedExpenseDto, user);
  }

  @Post(':id/pay')
  markAsPaid(@Param('id') id: string, @GetUser() user: User) {
    return this.fixedExpensesService.markAsPaid(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.fixedExpensesService.remove(id, user);
  }
}
