"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { CreateFixedExpenseDialog } from "./create-fixed-expense-dialog";
import { EditFixedExpenseDialog } from "./edit-fixed-expense-dialog";
import api from "@/lib/api/axios";

interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
}

export function FixedExpensesList() {
  const { toast } = useToast();
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<FixedExpense | null>(
    null
  );

  useEffect(() => {
    fetchFixedExpenses();
  }, []);

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

  async function toggleFixedExpense(id: string, isActive: boolean) {
    try {
      await api.patch(`/fixed-expenses/${id}/toggle`, { isActive });
      fetchFixedExpenses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado del gasto fijo",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gastos Fijos</h2>
        <CreateFixedExpenseDialog onExpenseCreated={fetchFixedExpenses} />
      </div>

      <div className="grid gap-4">
        {fixedExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{expense.description}</span>
                <span className="text-sm text-muted-foreground">
                  ({expense.category.name})
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Vence el día {expense.dueDate}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">${expense.amount}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedExpense(expense)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Switch
                checked={expense.isActive}
                onCheckedChange={(checked) =>
                  toggleFixedExpense(expense.id, checked)
                }
              />
            </div>
          </div>
        ))}
      </div>

      {selectedExpense && (
        <EditFixedExpenseDialog
          fixedExpense={selectedExpense}
          onExpenseUpdated={() => {
            fetchFixedExpenses();
            setSelectedExpense(null);
          }}
        />
      )}
    </div>
  );
}
