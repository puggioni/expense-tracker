export class DashboardResponseDto {
  totalBalance: number;
  monthlyBalance: {
    amount: number;
    percentage: number;
  };
  totalIncome: {
    amount: number;
    salary: number;
    freelance: number;
  };
  totalExpenses: {
    amount: number;
    fixed: number;
    variable: number;
  };
  recentTransactions: {
    id: string;
    description: string;
    category: string;
    date: Date;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
  }[];
  upcomingPayments: {
    description: string;
    amount: number;
    dueDate: Date;
    daysLeft: number;
    type: string;
  }[];
}
