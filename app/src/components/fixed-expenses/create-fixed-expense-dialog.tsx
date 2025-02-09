"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PlusCircle, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api/axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";

const formSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.string().min(1, "El monto es requerido"),
  dueDate: z.string().min(1, "La fecha de vencimiento es requerida"),
  categoryId: z.string().min(1, "La categoría es requerida"),
});

const newCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "fixed_expense" | "transfer";
}

interface CreateFixedExpenseDialogProps {
  onExpenseCreated: () => void;
  previousExpense?: {
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    category: {
      id: string;
      name: string;
    };
  };
}

export function CreateFixedExpenseDialog({
  onExpenseCreated,
  previousExpense,
}: CreateFixedExpenseDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: previousExpense?.description || "",
      amount: previousExpense?.amount?.toString() || "",
      dueDate:
        previousExpense?.dueDate || new Date().toISOString().split("T")[0],
      categoryId: previousExpense?.category?.id || "",
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await api.get<Category[]>(
        "/categories?type=fixed_expense"
      );
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
      const payload = {
        description: values.description,
        amount: parseFloat(values.amount),
        dueDate: values.dueDate,
        categoryId: values.categoryId,
        ...(previousExpense?.id
          ? { previousExpenseId: previousExpense.id }
          : {}),
      };

      await api.post("/fixed-expenses", payload);

      toast({
        title: "Gasto fijo creado",
        description: "El gasto fijo se ha creado correctamente",
      });

      onExpenseCreated();
      setOpen(false);
      form.reset();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el gasto fijo",
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset({
            description: previousExpense?.description || "",
            amount: previousExpense?.amount?.toString() || "",
            dueDate:
              previousExpense?.dueDate ||
              new Date().toISOString().split("T")[0],
            categoryId: previousExpense?.category?.id || "",
          });
        }
      }}
    >
      <DialogTrigger asChild>
        {previousExpense ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <CopyIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Gasto Fijo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {previousExpense ? "Copiar Gasto Fijo" : "Crear Nuevo Gasto Fijo"}
          </DialogTitle>
          <DialogDescription>
            {previousExpense
              ? "Crea un nuevo gasto fijo basado en uno existente"
              : "Ingresa los detalles del nuevo gasto fijo"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Vencimiento</FormLabel>
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
                            format(new Date(field.value), "PPP", {
                              locale: es,
                            })
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
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        footer={
                          field.value &&
                          format(new Date(field.value), "PPP", { locale: es })
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCreatingCategory(true)}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
          <CreateCategoryDialog
            onCategoryCreated={() => {
              fetchCategories();
              setIsCreatingCategory(false);
            }}
            type="fixed_expense"
            open={isCreatingCategory}
            onOpenChange={setIsCreatingCategory}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
