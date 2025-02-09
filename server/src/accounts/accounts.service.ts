import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(
    createAccountDto: CreateAccountDto,
    user: User,
  ): Promise<Account> {
    const account = this.accountRepository.create({
      ...createAccountDto,
      balance: createAccountDto.initialBalance || 0,
      user,
    });
    return this.accountRepository.save(account);
  }

  async findAll(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId, isActive: true },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async remove(id: string, userId: string): Promise<void> {
    const account = await this.findOne(id, userId);
    account.isActive = false;
    await this.accountRepository.save(account);
  }

  async updateBalance(
    id: string,
    amount: number,
    userId: string,
  ): Promise<Account> {
    const account = await this.findOne(id, userId);
    account.balance = Number(account.balance) + amount;
    return this.accountRepository.save(account);
  }
}
