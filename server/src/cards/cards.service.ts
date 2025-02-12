import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CardExpense } from './entities/card-expense.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateCardExpenseDto } from './dto/create-card-expense.dto';
import { User } from '../users/entities/user.entity';
import { addMonths, setDate } from 'date-fns';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface DolarResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(CardExpense)
    private cardExpensesRepository: Repository<CardExpense>,
    private readonly httpService: HttpService,
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

  private async getDolarTarjetaRate(): Promise<number> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<DolarResponse>(
          'https://dolarapi.com/v1/dolares/tarjeta',
        ),
      );
      return data.venta;
    } catch (error) {
      throw new Error('No se pudo obtener la cotización del dólar tarjeta');
    }
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

    let finalAmount = createCardExpenseDto.installmentAmount;

    if (createCardExpenseDto.isUSD) {
      const dolarRate = await this.getDolarTarjetaRate();
      finalAmount = createCardExpenseDto.installmentAmount * dolarRate;
    }

    const expense = this.cardExpensesRepository.create({
      ...createCardExpenseDto,
      installmentAmount: finalAmount,
      totalAmount: finalAmount * createCardExpenseDto.installments,
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
      const amount = Number(installmentAmount);

      for (let i = 0; i < months; i++) {
        const paymentDate = addMonths(new Date(firstPaymentDate), i);
        const monthKey = paymentDate.toISOString().slice(0, 7);

        const currentAmount = monthlyPayments.get(monthKey) || 0;
        monthlyPayments.set(monthKey, currentAmount + amount);
      }
    });

    return Array.from(monthlyPayments.entries())
      .map(([month, totalAmount]) => ({
        month,
        totalAmount: Number(totalAmount.toFixed(2)),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async updateExpense(
    cardId: string,
    expenseId: string,
    updateCardExpenseDto: CreateCardExpenseDto,
    user: User,
  ): Promise<CardExpense> {
    const card = await this.findOne(cardId, user);
    const expense = await this.cardExpensesRepository.findOne({
      where: { id: expenseId, card: { id: card.id } },
    });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    let finalAmount = updateCardExpenseDto.installmentAmount;

    if (updateCardExpenseDto.isUSD) {
      const dolarRate = await this.getDolarTarjetaRate();
      finalAmount = updateCardExpenseDto.installmentAmount * dolarRate;
    }

    Object.assign(expense, {
      ...updateCardExpenseDto,
      installmentAmount: finalAmount,
      totalAmount: finalAmount * updateCardExpenseDto.installments,
    });

    return this.cardExpensesRepository.save(expense);
  }

  async deleteExpense(
    cardId: string,
    expenseId: string,
    user: User,
  ): Promise<void> {
    const card = await this.findOne(cardId, user);
    const expense = await this.cardExpensesRepository.findOne({
      where: { id: expenseId, card: { id: card.id } },
    });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    await this.cardExpensesRepository.remove(expense);
  }
}
