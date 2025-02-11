"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api/axios";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CardExpenseDialog } from "./create-card-expense-dialog";

interface CardExpense {
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

interface MonthlyPayment {
  month: string;
  totalAmount: number;
}

interface CardDetailsProps {
  card: {
    id: string;
    name: string;
    bank: string;
    creditLimit: number;
    lastFourDigits: string;
    closingDay: number;
    dueDay: number;
  };
  onClose: () => void;
}

export function CardDetails({ card, onClose }: CardDetailsProps) {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<CardExpense[]>([]);
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>([]);
  const [expenseToEdit, setExpenseToEdit] = useState<CardExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<CardExpense | null>(
    null
  );
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchMonthlyPayments();
  }, []);

  async function fetchExpenses() {
    try {
      const response = await api.get<CardExpense[]>(
        `/cards/${card.id}/expenses`
      );
      setExpenses(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los gastos",
      });
    }
  }

  async function fetchMonthlyPayments() {
    try {
      const response = await api.get<MonthlyPayment[]>(
        `/cards/${card.id}/expenses/monthly`
      );
      setMonthlyPayments(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los pagos mensuales",
      });
    }
  }

  const usedLimit = expenses.reduce(
    (acc, exp) => acc + Number(exp.totalAmount),
    0
  );
  const formattedUsedLimit = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(usedLimit);

  const formattedCreditLimit = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(card.creditLimit);

  async function handleDeleteExpense() {
    if (!expenseToDelete) return;

    try {
      await api.delete(`/cards/${card.id}/expenses/${expenseToDelete.id}`);
      toast({
        title: "Éxito",
        description: "El gasto se ha eliminado correctamente",
      });
      fetchExpenses();
      fetchMonthlyPayments();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el gasto",
      });
    } finally {
      setExpenseToDelete(null);
      setIsConfirmDialogOpen(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {card.name} - {card.bank}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              •••• {card.lastFourDigits}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsExpenseDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Registrar Gasto
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Límite utilizado</span>
              <span>
                {formattedUsedLimit} / {formattedCreditLimit}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full mt-2">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min(
                    (expenses.reduce((acc, exp) => acc + exp.totalAmount, 0) /
                      card.creditLimit) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Consumos</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cuotas</TableHead>
                      <TableHead>Monto por Cuota</TableHead>
                      <TableHead>Monto Total</TableHead>
                      <TableHead>Próximo Vencimiento</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          {expense.isRecurring
                            ? "Recurrente"
                            : `${expense.installments} cuotas`}
                        </TableCell>
                        <TableCell>
                          ${expense.installmentAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ${expense.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {format(new Date(expense.dueDate), "PPP", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setExpenseToEdit(expense);
                                setIsExpenseDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setExpenseToDelete(expense);
                                setIsConfirmDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Calendario de Pagos
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyPayments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) =>
                        format(new Date(value), "MMM yyyy", { locale: es })
                      }
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(value)
                      }
                      labelFormatter={(label) =>
                        format(new Date(label), "MMMM yyyy", { locale: es })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="totalAmount"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "#2563eb",
                        stroke: "#2563eb",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#2563eb",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      name="Monto a Pagar"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CardExpenseDialog
        cardId={card.id}
        expense={expenseToEdit}
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        onSuccess={() => {
          fetchExpenses();
          fetchMonthlyPayments();
        }}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleDeleteExpense}
        title="Eliminar Gasto"
        description="¿Estás seguro que deseas eliminar este gasto?"
      />
    </>
  );
}
