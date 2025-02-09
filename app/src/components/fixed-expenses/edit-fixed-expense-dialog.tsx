"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PencilIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
}

interface EditFixedExpenseDialogProps {
  fixedExpense: {
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    category: {
      id: string;
      name: string;
    };
  };
  onExpenseUpdated: () => void;
}

export function EditFixedExpenseDialog({
  fixedExpense,
  onExpenseUpdated,
}: EditFixedExpenseDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: fixedExpense.description,
      amount: fixedExpense.amount.toString(),
      dueDate: fixedExpense.dueDate,
      categoryId: fixedExpense.category.id,
    },
  });

  const newCategoryForm = useForm<z.infer<typeof newCategorySchema>>({
    resolver: zodResolver(newCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  async function fetchCategories() {
    try {
      const response = await api.get<Category[]>("/categories?type=expense");
      setCategories(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las categorías",
      });
    }
  }

  async function createCategory(values: z.infer<typeof newCategorySchema>) {
    try {
      const response = await api.post("/categories", {
        ...values,
        type: "expense",
      });
      setCategories((prev) => [...prev, response.data]);
      form.setValue("categoryId", response.data.id);
      setIsCreatingCategory(false);
      newCategoryForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la categoría",
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
      };

      await api.put(`/fixed-expenses/${fixedExpense.id}`, payload);

      toast({
        title: "Gasto fijo actualizado",
        description: "El gasto fijo se ha actualizado correctamente",
      });

      form.reset();
      setOpen(false);
      onExpenseUpdated();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el gasto fijo",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            fetchCategories();
            setOpen(true);
          }}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Gasto Fijo</DialogTitle>
        </DialogHeader>

        {isCreatingCategory ? (
          <Form {...newCategoryForm}>
            <form
              onSubmit={newCategoryForm.handleSubmit(createCategory)}
              className="space-y-4"
            >
              <FormField
                control={newCategoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Servicios" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingCategory(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Categoría</Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Netflix" {...field} />
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
                      <Input
                        type="number"
                        min="0"
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
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
                        <button
                          className="flex w-full items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsCreatingCategory(true);
                          }}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Crear nueva categoría
                        </button>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fecha de vencimiento</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="datetime-local" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      El gasto se registrará automáticamente este día cada mes
                    </p>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
