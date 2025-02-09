"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import api from "@/lib/api/axios";
import { useToast } from "@/components/ui/use-toast";

type Transaction = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  date: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  fromAccount?: {
    id: string;
    name: string;
  };
  toAccount?: {
    id: string;
    name: string;
  };
};

export function TransactionHistory() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<
    "all" | "income" | "expense" | "transfer"
  >("all");

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await api.get<Transaction[]>("/transactions");
        setTransactions(response.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las transacciones",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [toast]);

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  const formatAmount = (amount: number, type: Transaction["type"]) => {
    const formattedAmount = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    return (
      <span
        className={cn(
          "font-medium",
          type === "income" && "text-green-500",
          type === "expense" && "text-red-500"
        )}
      >
        {type === "expense" ? "-" : ""}
        {formattedAmount}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={filter === "income" ? "default" : "outline"}
          onClick={() => setFilter("income")}
        >
          Ingresos
        </Button>
        <Button
          variant={filter === "expense" ? "default" : "outline"}
          onClick={() => setFilter("expense")}
        >
          Gastos
        </Button>
        <Button
          variant={filter === "transfer" ? "default" : "outline"}
          onClick={() => setFilter("transfer")}
        >
          Transferencias
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Cargando transacciones...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay transacciones registradas
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>{transaction.category.name}</TableCell>
                  <TableCell>
                    {transaction.type === "transfer"
                      ? `${transaction.fromAccount?.name} → ${transaction.toAccount?.name}`
                      : transaction.fromAccount?.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
