"use client";

import { useState } from "react";
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
  firstPaymentDate: z.date({
    required_error: "La fecha del primer pago es requerida",
  }),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: expense?.description || "",
      installmentAmount: expense?.installmentAmount || 0,
      installments: expense?.installments || 1,
      isRecurring: expense?.isRecurring || false,
      firstPaymentDate: expense?.firstPaymentDate
        ? new Date(expense.firstPaymentDate)
        : new Date(),
    },
  });

  const isRecurring = form.watch("isRecurring");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      if (expense) {
        // Modo edición
        await api.patch(`/cards/${cardId}/expenses/${expense.id}`, {
          ...values,
          firstPaymentDate: format(values.firstPaymentDate, "yyyy-MM-dd"),
        });
      } else {
        // Modo creación
        await api.post(`/cards/${cardId}/expenses`, {
          ...values,
          firstPaymentDate: format(values.firstPaymentDate, "yyyy-MM-dd"),
        });
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
              name="firstPaymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha del Primer Pago</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                        onSelect={field.onChange}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
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
