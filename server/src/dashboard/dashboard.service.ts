import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import {
  endOfMonth,
  startOfMonth,
  subMonths,
  differenceInDays,
} from 'date-fns';
import { CategoryType } from 'src/categories/entities/category.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getDashboardData(user: User): Promise<DashboardResponseDto> {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Obtener transacciones del mes actual
    const currentMonthTransactions = await this.transactionRepository.find({
      where: {
        user: { id: user.id },
        date: Between(currentMonthStart, currentMonthEnd),
      },
      relations: ['category'],
      order: { date: 'DESC' },
    });

    // Obtener transacciones del mes anterior para comparación
    const lastMonthTransactions = await this.transactionRepository.find({
      where: {
        user: { id: user.id },
        date: Between(lastMonthStart, lastMonthEnd),
      },
    });

    // Calcular totales del mes actual
    const currentMonthIncome = currentMonthTransactions
      .filter((t) => t.type === CategoryType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === CategoryType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calcular totales del mes anterior
    const lastMonthBalance = lastMonthTransactions.reduce(
      (sum, t) =>
        sum +
        (t.type === CategoryType.INCOME ? Number(t.amount) : -Number(t.amount)),
      0,
    );

    const currentMonthBalance = currentMonthIncome - currentMonthExpenses;
    const balancePercentageChange =
      lastMonthBalance === 0
        ? 100
        : ((currentMonthBalance - lastMonthBalance) /
            Math.abs(lastMonthBalance)) *
          100;

    // Calcular ingresos por categoría
    const salaryIncome = currentMonthTransactions
      .filter(
        (t) => t.type === CategoryType.INCOME && t.category.name === 'Sueldo',
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const freelanceIncome = currentMonthTransactions
      .filter(
        (t) =>
          t.type === CategoryType.INCOME && t.category.name === 'Freelance',
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calcular gastos por tipo
    const fixedExpenses = currentMonthTransactions
      .filter(
        (t) => t.type === CategoryType.EXPENSE && t.category.name === 'Fijos',
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const variableExpenses = currentMonthTransactions
      .filter(
        (t) =>
          t.type === CategoryType.EXPENSE && !t.category.name.includes('Fijos'),
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Obtener próximos vencimientos
    const upcomingPayments = currentMonthTransactions
      .filter((t) => t.type === CategoryType.EXPENSE && new Date(t.date) > now)
      .map((t) => ({
        description: t.description,
        amount: Number(t.amount),
        dueDate: t.date,
        daysLeft: differenceInDays(t.date, now),
        type: t.category.name,
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    return {
      totalBalance: currentMonthBalance,
      monthlyBalance: {
        amount: currentMonthBalance,
        percentage: Number(balancePercentageChange.toFixed(1)),
      },
      totalIncome: {
        amount: currentMonthIncome,
        salary: salaryIncome,
        freelance: freelanceIncome,
      },
      totalExpenses: {
        amount: currentMonthExpenses,
        fixed: fixedExpenses,
        variable: variableExpenses,
      },
      recentTransactions: currentMonthTransactions.slice(0, 5).map((t) => ({
        id: t.id,
        description: t.description,
        category: t.category.name,
        date: t.date,
        amount: Number(t.amount),
        type: t.type as unknown as 'INCOME' | 'EXPENSE',
      })),
      upcomingPayments,
    };
  }
}
