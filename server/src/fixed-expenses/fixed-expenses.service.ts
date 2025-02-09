import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixedExpense } from './entities/fixed-expense.entity';
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import { ToggleFixedExpenseDto } from './dto/toggle-fixed-expense.dto';
import { User } from '../users/entities/user.entity';
import { CategoriesService } from '../categories/categories.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CategoryType } from '../categories/entities/category.entity';

@Injectable()
export class FixedExpensesService {
  constructor(
    @InjectRepository(FixedExpense)
    private readonly fixedExpenseRepository: Repository<FixedExpense>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    createFixedExpenseDto: CreateFixedExpenseDto,
    user: User,
  ): Promise<FixedExpense> {
    const category = await this.categoriesService.findOne(
      createFixedExpenseDto.categoryId,
      user.id,
    );

    const fixedExpense = this.fixedExpenseRepository.create({
      ...createFixedExpenseDto,
      dueDate: new Date(createFixedExpenseDto.dueDate),
      user,
      category,
    });

    return this.fixedExpenseRepository.save(fixedExpense);
  }

  async findAll(user: User): Promise<FixedExpense[]> {
    const expenses = await this.fixedExpenseRepository.find({
      where: { user: { id: user.id } },
      relations: ['category'],
      order: { dueDate: 'ASC' },
    });

    return expenses.map((expense) => {
      const plainExpense = { ...expense } as any;
      return plainExpense;
    });
  }

  async findOne(id: string, user: User): Promise<FixedExpense> {
    const fixedExpense = await this.fixedExpenseRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['category'],
    });

    if (!fixedExpense) {
      throw new NotFoundException('Gasto fijo no encontrado');
    }

    return fixedExpense;
  }

  async toggle(
    id: string,
    toggleFixedExpenseDto: ToggleFixedExpenseDto,
    user: User,
  ): Promise<FixedExpense> {
    const fixedExpense = await this.findOne(id, user);
    fixedExpense.isActive = toggleFixedExpenseDto.isActive;
    return this.fixedExpenseRepository.save(fixedExpense);
  }

  async remove(id: string, user: User): Promise<void> {
    const fixedExpense = await this.findOne(id, user);
    await this.fixedExpenseRepository.remove(fixedExpense);
  }

  async markAsPaid(id: string, user: User): Promise<FixedExpense> {
    const fixedExpense = await this.findOne(id, user);

    // Crear la transacción
    const transaction = this.transactionRepository.create({
      type: CategoryType.EXPENSE,
      amount: fixedExpense.amount,
      date: new Date(),
      description: `[Gasto Fijo] ${fixedExpense.description}`,
      user,
      category: fixedExpense.category,
    });
    await this.transactionRepository.save(transaction);

    // Actualizar la fecha de último pago
    fixedExpense.lastPaymentDate = new Date();
    return this.fixedExpenseRepository.save(fixedExpense);
  }

  async update(
    id: string,
    updateFixedExpenseDto: UpdateFixedExpenseDto,
    user: User,
  ): Promise<FixedExpense> {
    const fixedExpense = await this.findOne(id, user);
    const category = await this.categoriesService.findOne(
      updateFixedExpenseDto.categoryId,
      user.id,
    );

    Object.assign(fixedExpense, {
      ...updateFixedExpenseDto,
      category,
    });

    return this.fixedExpenseRepository.save(fixedExpense);
  }
}
