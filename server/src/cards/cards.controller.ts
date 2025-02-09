import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateCardExpenseDto } from './dto/create-card-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @GetUser() user: User) {
    return this.cardsService.create(createCardDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.cardsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.findOne(id, user);
  }

  @Post(':id/expenses')
  createExpense(
    @Param('id') id: string,
    @Body() createCardExpenseDto: CreateCardExpenseDto,
    @GetUser() user: User,
  ) {
    return this.cardsService.createExpense(id, createCardExpenseDto, user);
  }

  @Get(':id/expenses')
  getExpenses(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.getExpenses(id, user);
  }

  @Get(':id/expenses/monthly')
  getMonthlyPayments(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.getMonthlyPayments(id, user);
  }
}
