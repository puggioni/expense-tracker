import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('fixed_expenses')
export class FixedExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  lastPaymentDate: Date;

  @Column({ nullable: true })
  previousExpenseId: string;

  @ManyToOne(() => User, (user) => user.fixedExpenses)
  user: User;

  @ManyToOne(() => Category)
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isPaid(): boolean {
    if (!this.lastPaymentDate) return false;
    return this.lastPaymentDate >= this.dueDate;
  }

  getDaysUntilDue(): number {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
