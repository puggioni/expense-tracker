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
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PlusCircle, CalendarIcon, Loader2 } from "lucide-react";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "transfer";
}

const formSchema = z.object({
  accountId: z.string().min(1, "La cuenta es requerida"),
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
  type: z.enum(["income", "expense"]),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
});

export function TransactionForm() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: "",
      categoryId: "",
      amount: "",
      description: "",
      type: "expense",
      date: undefined,
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
      setCategories(response.data);
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
      setIsSubmitting(true);

      const payload = {
        fromAccountId: values.accountId,
        categoryId: values.categoryId,
        amount: parseFloat(values.amount),
        description: values.description || "",
        type: values.type,
        date: values.date ? new Date(values.date) : new Date(),
      };

      await api.post("/transactions", payload);

      toast({
        title: "Transacción creada",
        description: "La transacción se ha creado correctamente",
      });

      form.reset();
    } catch (error) {
      console.error("Error response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la transacción",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
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
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      footer={
                        field.value &&
                        format(field.value, "PPP", { locale: es })
                      }
                    />
                  </PopoverContent>
                </Popover>
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
                  <div className="flex-1">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter(
                            (category) =>
                              category.type === form.getValues("type")
                          )
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      form.watch("type") === "income"
                        ? "hover:bg-green-100 hover:text-green-900 dark:hover:bg-green-800 dark:hover:text-green-100"
                        : "hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-800 dark:hover:text-red-100"
                    )}
                    onClick={() => setIsCreatingCategory(true)}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta</FormLabel>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cuenta" />
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
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      form.watch("type") === "income"
                        ? "hover:bg-green-100 hover:text-green-900 dark:hover:bg-green-800 dark:hover:text-green-100"
                        : "hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-800 dark:hover:text-red-100"
                    )}
                    onClick={() => setIsCreatingAccount(true)}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
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
                  <Input placeholder="Descripción" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className={cn(
            form.watch("type") === "income"
              ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 w-full"
              : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 w-full"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrar"
          )}
        </Button>
      </form>
      <CreateCategoryDialog
        onCategoryCreated={() => {
          fetchCategories();
          setIsCreatingCategory(false);
        }}
        type={form.getValues("type")}
        open={isCreatingCategory}
        onOpenChange={setIsCreatingCategory}
      />
      <CreateAccountDialog
        onAccountCreated={() => {
          fetchAccounts();
          setIsCreatingAccount(false);
        }}
        open={isCreatingAccount}
        onOpenChange={setIsCreatingAccount}
      />
    </Form>
  );
}
