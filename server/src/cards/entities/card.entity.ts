import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CardColor } from '../constants/card-color.enum';
import { CardExpense } from './card-expense.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  bank: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  creditLimit: number;

  @Column({ type: 'enum', enum: CardColor })
  color: CardColor;

  @Column()
  lastFourDigits: string;

  @Column()
  closingDay: number;

  @Column()
  dueDay: number;

  @ManyToOne(() => User, (user) => user.cards)
  user: User;

  @OneToMany(() => CardExpense, (expense) => expense.card)
  expenses: CardExpense[];
}
