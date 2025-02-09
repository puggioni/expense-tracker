import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { AccountsModule } from './accounts/accounts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CardsModule } from './cards/cards.module';
import configuration from './config/configuration';

// Entities
import { User } from './users/entities/user.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { Transfer } from './transactions/entities/transfer.entity';
import { Category } from './categories/entities/category.entity';
import { Account } from './accounts/entities/account.entity';
import { Card } from './cards/entities/card.entity';
import { CardExpense } from './cards/entities/card-expense.entity';
import { FixedExpensesModule } from './fixed-expenses/fixed-expenses.module';
import { FixedExpense } from './fixed-expenses/entities/fixed-expense.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          User,
          Transaction,
          Transfer,
          Category,
          Account,
          Card,
          CardExpense,
          FixedExpense,
        ],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TransactionsModule,
    CategoriesModule,
    AccountsModule,
    DashboardModule,
    CardsModule,
    FixedExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
