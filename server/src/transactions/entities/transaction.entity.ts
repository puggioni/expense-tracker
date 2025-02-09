import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  Category,
  CategoryType,
} from '../../categories/entities/category.entity';
import { Account } from '../../accounts/entities/account.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    enumName: 'category_type',
  })
  type: CategoryType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'fromAccountId' })
  fromAccount?: Account;

  @Column({ nullable: true })
  fromAccountId?: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'toAccountId' })
  toAccount?: Account;

  @Column({ nullable: true })
  toAccountId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
