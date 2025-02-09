import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Transfer } from './entities/transfer.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { User } from '../users/entities/user.entity';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CategoryType } from 'src/categories/entities/category.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const category = await this.categoriesService.findOne(
      createTransactionDto.categoryId,
      userId,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let fromAccount = null;
    let toAccount = null;

    if (createTransactionDto.type === CategoryType.TRANSFER) {
      if (
        !createTransactionDto.fromAccountId ||
        !createTransactionDto.toAccountId
      ) {
        throw new Error('Transfer requires both fromAccountId and toAccountId');
      }

      fromAccount = await this.accountsService.findOne(
        createTransactionDto.fromAccountId,
        userId,
      );
      toAccount = await this.accountsService.findOne(
        createTransactionDto.toAccountId,
        userId,
      );

      if (!fromAccount || !toAccount) {
        throw new NotFoundException('One or both accounts not found');
      }

      // Verificar que las cuentas pertenezcan al usuario
      if (fromAccount.userId !== userId || toAccount.userId !== userId) {
        throw new Error('Accounts must belong to the user');
      }

      // Verificar que haya saldo suficiente
      if (fromAccount.balance < createTransactionDto.amount) {
        throw new Error('Insufficient funds');
      }

      // Actualizar saldos
      await this.accountsService.updateBalance(
        fromAccount.id,
        fromAccount.balance - createTransactionDto.amount,
        userId,
      );
      await this.accountsService.updateBalance(
        toAccount.id,
        toAccount.balance + createTransactionDto.amount,
        userId,
      );
    } else if (createTransactionDto.fromAccountId) {
      fromAccount = await this.accountsService.findOne(
        createTransactionDto.fromAccountId,
        userId,
      );
      if (!fromAccount) {
        throw new NotFoundException('Account not found');
      }

      // Verificar que la cuenta pertenezca al usuario
      if (fromAccount.userId !== userId) {
        throw new Error('Account must belong to the user');
      }

      // Actualizar saldo
      const amount =
        createTransactionDto.type === CategoryType.INCOME
          ? createTransactionDto.amount
          : -createTransactionDto.amount;

      await this.accountsService.updateBalance(
        fromAccount.id,
        fromAccount.balance + amount,
        userId,
      );
    }

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      userId,
    });

    return this.transactionRepository.save(transaction);
  }

  async findAll(userId: string) {
    return this.transactionRepository.find({
      where: { userId },
      relations: ['category', 'fromAccount', 'toAccount'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['category', 'fromAccount', 'toAccount'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const transaction = await this.findOne(id, userId);

    // Si se está actualizando el monto o el tipo, necesitamos revertir los cambios en los saldos
    if (
      updateTransactionDto.amount !== undefined ||
      updateTransactionDto.type !== undefined ||
      updateTransactionDto.fromAccountId !== undefined ||
      updateTransactionDto.toAccountId !== undefined
    ) {
      throw new Error(
        'Cannot update amount, type or accounts of an existing transaction',
      );
    }

    Object.assign(transaction, updateTransactionDto);
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    // Revertir los cambios en los saldos
    if (transaction.type === CategoryType.TRANSFER) {
      await this.accountsService.updateBalance(
        transaction.fromAccountId,
        transaction.fromAccount.balance + transaction.amount,
        userId,
      );
      await this.accountsService.updateBalance(
        transaction.toAccountId,
        transaction.toAccount.balance - transaction.amount,
        userId,
      );
    } else if (transaction.fromAccountId) {
      const amount =
        transaction.type === CategoryType.INCOME
          ? -transaction.amount
          : transaction.amount;

      await this.accountsService.updateBalance(
        transaction.fromAccountId,
        transaction.fromAccount.balance + amount,
        userId,
      );
    }

    return this.transactionRepository.remove(transaction);
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    user: User,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { categoryId, fromAccountId, toAccountId, ...transactionData } =
        createTransactionDto;

      const [category, fromAccount, toAccount] = await Promise.all([
        this.categoriesService.findOne(categoryId, user.id),
        this.accountsService.findOne(fromAccountId, user.id),
        toAccountId
          ? this.accountsService.findOne(toAccountId, user.id)
          : Promise.resolve(null),
      ]);

      if (category.type !== transactionData.type) {
        throw new BadRequestException(
          'Transaction type does not match category type',
        );
      }

      const transaction = this.transactionRepository.create({
        ...transactionData,
        category,
        fromAccount,
        toAccount,
        user,
      });

      await queryRunner.manager.save(transaction);

      // Actualizar saldos de las cuentas
      if (transaction.type === CategoryType.TRANSFER) {
        if (!fromAccount || !toAccount) {
          throw new BadRequestException(
            'Both accounts are required for transfers',
          );
        }

        await Promise.all([
          this.accountsService.updateBalance(
            fromAccount.id,
            -transaction.amount,
            user.id,
          ),
          this.accountsService.updateBalance(
            toAccount.id,
            transaction.amount,
            user.id,
          ),
        ]);
      } else if (transaction.type === CategoryType.EXPENSE) {
        await this.accountsService.updateBalance(
          fromAccount.id,
          -transaction.amount,
          user.id,
        );
      } else {
        // INCOME
        await this.accountsService.updateBalance(
          fromAccount.id,
          transaction.amount,
          user.id,
        );
      }

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createTransfer(
    createTransferDto: CreateTransferDto,
    user: User,
  ): Promise<Transfer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { fromAccountId, toAccountId, amount, ...transferData } =
        createTransferDto;

      if (fromAccountId === toAccountId) {
        throw new BadRequestException(
          'Source and destination accounts must be different',
        );
      }

      const [fromAccount, toAccount] = await Promise.all([
        this.accountsService.findOne(fromAccountId, user.id),
        this.accountsService.findOne(toAccountId, user.id),
      ]);

      const transfer = this.transferRepository.create({
        ...transferData,
        amount,
        fromAccount,
        toAccount,
        user,
      });

      await queryRunner.manager.save(transfer);

      await Promise.all([
        this.accountsService.updateBalance(fromAccountId, -amount, user.id),
        this.accountsService.updateBalance(toAccountId, amount, user.id),
      ]);

      await queryRunner.commitTransaction();
      return transfer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['category', 'account'],
      order: { date: 'DESC' },
    });
  }

  async findAllTransfers(userId: string): Promise<Transfer[]> {
    return this.transferRepository.find({
      where: { user: { id: userId } },
      relations: ['fromAccount', 'toAccount'],
      order: { date: 'DESC' },
    });
  }

  async findTransactionById(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category', 'account'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findTransferById(id: string, userId: string): Promise<Transfer> {
    const transfer = await this.transferRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['fromAccount', 'toAccount'],
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }
}
