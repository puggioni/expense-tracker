import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from './entities/card.entity';
import { CardExpense } from './entities/card-expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, CardExpense])],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
