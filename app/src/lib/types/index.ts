export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: "income" | "expense" | "transfer";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note?: string;
  date: string;
  category: Category;
  account: Account;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: string;
  amount: number;
  note?: string;
  date: string;
  fromAccount: Account;
  toAccount: Account;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CardExpense {
  id: string;
  description: string;
  installmentAmount: number;
  installments: number;
  totalAmount: number;
  isRecurring: boolean;
  firstPaymentDate: string;
  closingDate: string;
  dueDate: string;
  isPaid: boolean;
}

export interface Card {
  id: string;
  name: string;
  bank: string;
  lastFourDigits: string;
  creditLimit: number;
  color: "blue" | "black" | "green" | "red";
  closingDay: number;
  dueDay: number;
}
