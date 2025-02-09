"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CreateAccountDialog } from "@/components/accounts/create-account-dialog";
import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";
import api from "@/lib/api/axios";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
}

const formSchema = z.object({
  fromAccountId: z.string().min(1, "La cuenta de origen es requerida"),
  toAccountId: z.string().min(1, "La cuenta de destino es requerida"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  amount: z.string().refine(
    (value) => {
      const number = parseFloat(value);
      return !isNaN(number) && number > 0;
    },
    {
      message: "El monto debe ser un número positivo",
    }
  ),
  description: z.string().optional(),
});

export function TransferForm() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      categoryId: "",
      amount: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await api.get<Account[]>("/accounts");
      setAccounts(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las cuentas",
      });
    }
  }

  async function fetchCategories() {
    try {
      const response = await api.get<Category[]>("/categories");
      setCategories(
        response.data.filter((category) => category.type === "TRANSFER")
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las categorías",
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await api.post("/transactions/transfer", values);

      toast({
        title: "Transferencia creada",
        description: "La transferencia se ha creado correctamente",
      });

      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la transferencia",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fromAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuenta de origen</FormLabel>
              <div className="flex gap-2">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cuenta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateAccountDialog
                  onAccountCreated={fetchAccounts}
                  open={false}
                  onOpenChange={() => {}}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="toAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuenta de destino</FormLabel>
              <div className="flex gap-2">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cuenta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts
                      .filter(
                        (account) => account.id !== form.watch("fromAccountId")
                      )
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <CreateAccountDialog
                  onAccountCreated={fetchAccounts}
                  open={false}
                  onOpenChange={() => {}}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <div className="flex gap-2">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateCategoryDialog
                  onCategoryCreated={fetchCategories}
                  type="transfer"
                  open={false}
                  onOpenChange={() => {}}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Realizar transferencia
        </Button>
      </form>
    </Form>
  );
}
