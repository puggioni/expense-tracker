import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CardExpense } from './entities/card-expense.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateCardExpenseDto } from './dto/create-card-expense.dto';
import { User } from '../users/entities/user.entity';
import { addMonths, setDate } from 'date-fns';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(CardExpense)
    private cardExpensesRepository: Repository<CardExpense>,
  ) {}

  async create(createCardDto: CreateCardDto, user: User): Promise<Card> {
    const card = this.cardsRepository.create({
      ...createCardDto,
      user,
    });
    return this.cardsRepository.save(card);
  }

  async findAll(user: User): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { user: { id: user.id } },
      relations: ['expenses'],
    });
  }

  async findOne(id: string, user: User): Promise<Card> {
    return this.cardsRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['expenses'],
    });
  }

  private calculateClosingAndDueDates(
    firstPaymentDate: Date,
    closingDay: number,
    dueDay: number,
  ): { closingDate: Date; dueDate: Date } {
    const paymentMonth = firstPaymentDate.getMonth();
    const paymentYear = firstPaymentDate.getFullYear();

    // Calculate closing date (previous month)
    let closingDate = setDate(
      new Date(paymentYear, paymentMonth - 1, 1),
      closingDay,
    );

    // Calculate due date
    let dueDate = setDate(new Date(paymentYear, paymentMonth, 1), dueDay);

    // Adjust dates if the first payment is after the due date
    if (firstPaymentDate > dueDate) {
      closingDate = setDate(new Date(paymentYear, paymentMonth, 1), closingDay);
      dueDate = setDate(new Date(paymentYear, paymentMonth + 1, 1), dueDay);
    }

    return { closingDate, dueDate };
  }

  async createExpense(
    cardId: string,
    createCardExpenseDto: CreateCardExpenseDto,
    user: User,
  ): Promise<CardExpense> {
    const card = await this.findOne(cardId, user);
    const firstPaymentDate = new Date(createCardExpenseDto.firstPaymentDate);

    const { closingDate, dueDate } = this.calculateClosingAndDueDates(
      firstPaymentDate,
      card.closingDay,
      card.dueDay,
    );

    const expense = this.cardExpensesRepository.create({
      ...createCardExpenseDto,
      totalAmount:
        createCardExpenseDto.installmentAmount *
        createCardExpenseDto.installments,
      firstPaymentDate,
      closingDate,
      dueDate,
      card,
    });

    return this.cardExpensesRepository.save(expense);
  }

  async getExpenses(cardId: string, user: User): Promise<CardExpense[]> {
    const card = await this.findOne(cardId, user);
    return this.cardExpensesRepository.find({
      where: { card: { id: card.id } },
      order: { firstPaymentDate: 'ASC' },
    });
  }

  async getMonthlyPayments(cardId: string, user: User): Promise<any[]> {
    const expenses = await this.getExpenses(cardId, user);

    const monthlyPayments = new Map<string, number>();

    expenses.forEach((expense) => {
      const { installmentAmount, installments, firstPaymentDate, isRecurring } =
        expense;
      const months = isRecurring ? 12 : installments;

      for (let i = 0; i < months; i++) {
        const paymentDate = addMonths(new Date(firstPaymentDate), i);
        const monthKey = paymentDate.toISOString().slice(0, 7); // YYYY-MM format

        const currentAmount = monthlyPayments.get(monthKey) || 0;
        monthlyPayments.set(monthKey, currentAmount + installmentAmount);
      }
    });

    // Convert to array and sort by month
    return Array.from(monthlyPayments.entries())
      .map(([month, totalAmount]) => ({
        month,
        totalAmount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
