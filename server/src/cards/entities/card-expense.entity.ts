import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Card } from './card.entity';

@Entity()
export class CardExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  installmentAmount: number;

  @Column()
  installments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column()
  isRecurring: boolean;

  @Column({ type: 'date' })
  firstPaymentDate: Date;

  @Column({ type: 'date' })
  closingDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ default: false })
  isPaid: boolean;

  @ManyToOne(() => Card, (card) => card.expenses)
  card: Card;
}
