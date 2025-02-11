"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PlusCircle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api/axios";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { CardExpense } from "@/lib/types";

const formSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  installmentAmount: z.coerce
    .number()
    .min(1, "El monto por cuota debe ser mayor a 0"),
  installments: z.coerce
    .number()
    .min(1, "El número de cuotas debe ser mayor a 0"),
  isRecurring: z.boolean(),
  startMonth: z.string().min(1, "El mes de inicio es requerido"), // YYYY-MM format
});

type FormValues = z.infer<typeof formSchema>;

interface CardExpenseDialogProps {
  cardId: string;
  expense?: CardExpense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CardExpenseDialog({
  cardId,
  expense,
  open,
  onOpenChange,
  onSuccess,
}: CardExpenseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      installmentAmount: 0,
      installments: 1,
      isRecurring: false,
      startMonth: format(new Date(), "yyyy-MM"),
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        installmentAmount: Number(expense.installmentAmount),
        installments: expense.installments,
        isRecurring: expense.isRecurring,
        startMonth: expense.firstPaymentDate.substring(0, 7), // Get YYYY-MM from YYYY-MM-DD
      });
    }
  }, [expense, form]);

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      const payload = {
        ...values,
        // Agregar el día 1 al mes seleccionado
        firstPaymentDate: `${values.startMonth}-01`,
      };

      if (expense) {
        await api.patch(`/cards/${cardId}/expenses/${expense.id}`, payload);
      } else {
        await api.post(`/cards/${cardId}/expenses`, payload);
      }

      toast({
        title: "Éxito",
        description: `El gasto se ha ${expense ? "actualizado" : "registrado"} correctamente`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo ${expense ? "actualizar" : "registrar"} el gasto`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const installmentAmount = form.watch("installmentAmount");
  const installments = form.watch("installments");
  const totalAmount = (installmentAmount || 0) * (installments || 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Editar" : "Registrar"} Gasto</DialogTitle>
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
                    <Input placeholder="Descripción del gasto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installmentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto por Cuota</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Cuotas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      disabled={form.watch("isRecurring")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Débito Automático</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("installments", 99);
                        } else {
                          form.setValue("installments", 1);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mes de Inicio</FormLabel>
                  <FormControl>
                    <Input
                      type="month"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">
                Monto Total: ${totalAmount.toLocaleString()}
              </p>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {expense ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
