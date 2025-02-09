"use client";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransferForm } from "@/components/transactions/transfer-form";
import { TransactionHistory } from "@/components/transactions/transaction-history";

export default function TransactionsPage() {
  return (
    <AuthenticatedLayout>
      <div className="container py-6">
        <div className="flex flex-col gap-8">
          <Tabs defaultValue="transaction" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transaction">Transacción</TabsTrigger>
              <TabsTrigger value="transfer">Transferencia</TabsTrigger>
            </TabsList>
            <TabsContent value="transaction" className="space-y-6">
              <TransactionForm />
              <TransactionHistory />
            </TabsContent>
            <TabsContent value="transfer" className="space-y-6">
              <TransferForm />
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
