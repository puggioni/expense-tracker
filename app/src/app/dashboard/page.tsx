"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  PencilIcon,
} from "lucide-react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api/axios";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CreateFixedExpenseDialog } from "@/components/fixed-expenses/create-fixed-expense-dialog";
import { EditFixedExpenseDialog } from "@/components/fixed-expenses/edit-fixed-expense-dialog";
import { addDays, isBefore, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { format } from "date-fns";

interface DashboardData {
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
    type: "INCOME" | "EXPENSE";
  }[];
  upcomingPayments: {
    description: string;
    amount: number;
    dueDate: Date;
    daysLeft: number;
    type: string;
  }[];
}

interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  isActive: boolean;
  isPaidThisMonth: boolean;
  category: {
    id: string;
    name: string;
  };
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchFixedExpenses();
  }, []);

  async function fetchDashboardData() {
    try {
      const response = await api.get<DashboardData>("/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
      });
    }
  }

  async function fetchFixedExpenses() {
    try {
      const response = await api.get<FixedExpense[]>("/fixed-expenses");
      setFixedExpenses(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los gastos fijos",
      });
    }
  }

  async function markAsPaid(id: string) {
    try {
      await api.post(`/fixed-expenses/${id}/pay`);
      await fetchFixedExpenses();
      await fetchDashboardData();
      toast({
        title: "Pago registrado",
        description: "El pago se ha registrado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el pago",
      });
    }
  }

  if (!dashboardData) return null;
  return (
    <AuthenticatedLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard Financiero</h1>

        {/* Balance Total */}
        <Card className="mb-6 bg-gradient-to-r from-zinc-900 to-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-white">
              Balance Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {formatCurrency(dashboardData.totalBalance)} USD
            </div>
          </CardContent>
        </Card>

        {/* Cards Grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {/* Balance Mensual */}
          <Card className="bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-200">
                Balance Mensual
              </CardTitle>
              <div className="p-1 bg-zinc-800 rounded">
                <CalendarIcon className="h-4 w-4 text-zinc-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.monthlyBalance.amount)}
              </div>
              <div className="flex items-center text-xs text-zinc-400">
                {dashboardData.monthlyBalance.percentage >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={
                    dashboardData.monthlyBalance.percentage >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {Math.abs(dashboardData.monthlyBalance.percentage)}%
                </span>
                <span className="ml-1">vs último mes</span>
              </div>
            </CardContent>
          </Card>

          {/* Ingresos Totales */}
          <Card className="bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-200">
                Ingresos Totales
              </CardTitle>
              <div className="p-1 bg-zinc-800 rounded">
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.totalIncome.amount)}
              </div>
              <div className="text-xs text-zinc-400">
                Sueldos: {formatCurrency(dashboardData.totalIncome.salary)} |
                Freelance: {formatCurrency(dashboardData.totalIncome.freelance)}
              </div>
            </CardContent>
          </Card>

          {/* Gastos Totales */}
          <Card className="bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-200">
                Gastos Totales
              </CardTitle>
              <div className="p-1 bg-zinc-800 rounded">
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.totalExpenses.amount)}
              </div>
              <div className="text-xs text-zinc-400">
                Fijos: {formatCurrency(dashboardData.totalExpenses.fixed)} |
                Variables:{" "}
                {formatCurrency(dashboardData.totalExpenses.variable)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions and Upcoming Payments */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Transactions */}
          <Card className="bg-zinc-900/30">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Últimas Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded ${
                          transaction.type === "INCOME"
                            ? "bg-green-500/20"
                            : "bg-red-500/20"
                        }`}
                      >
                        {transaction.type === "INCOME" ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          transaction.type === "INCOME"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card className="bg-zinc-900/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-white">
                Próximos Vencimientos
              </CardTitle>
              <CreateFixedExpenseDialog onExpenseCreated={fetchFixedExpenses} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fixedExpenses
                  .filter((expense) => expense.isActive)
                  .sort(
                    (a, b) =>
                      new Date(a.dueDate).getTime() -
                      new Date(b.dueDate).getTime()
                  )
                  .map((expense) => {
                    const today = startOfToday();
                    const dueDate = new Date(expense.dueDate);
                    const warningDate = addDays(dueDate, -4);
                    let status = "";

                    if (expense.isPaidThisMonth) {
                      status = "text-green-500 dark:text-green-400";
                    } else if (isBefore(dueDate, today)) {
                      status = "text-red-500 dark:text-red-400";
                    } else if (isBefore(warningDate, today)) {
                      status = "text-yellow-500 dark:text-yellow-400";
                    }

                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-lg bg-zinc-900 p-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="min-w-[40px] text-sm font-medium text-zinc-400">
                            {format(new Date(expense.dueDate), "PPP", {
                              locale: es,
                            })}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${status}`}>
                                {expense.description}
                              </p>
                              {expense.isPaidThisMonth && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                  Pagado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400">
                              {expense.category.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                          <EditFixedExpenseDialog
                            fixedExpense={expense}
                            onExpenseUpdated={() => {
                              fetchFixedExpenses();
                              fetchDashboardData();
                            }}
                          />
                          <CreateFixedExpenseDialog
                            onExpenseCreated={() => {
                              fetchFixedExpenses();
                              fetchDashboardData();
                            }}
                            previousExpense={expense}
                          />
                          {!expense.isPaidThisMonth && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsPaid(expense.id)}
                            >
                              Pagar
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {fixedExpenses.filter((expense) => expense.isActive).length ===
                  0 && (
                  <p className="text-sm text-zinc-400 text-center py-4">
                    No hay gastos fijos configurados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
