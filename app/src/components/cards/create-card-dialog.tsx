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
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import api from "@/lib/api/axios";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  bank: z.string().min(1, "El banco es requerido"),
  creditLimit: z.string().refine(
    (value) => {
      const number = parseFloat(value);
      return !isNaN(number) && number > 0;
    },
    {
      message: "El límite debe ser un número positivo",
    }
  ),
  color: z.enum(["blue", "black", "green", "red"]),
  lastFourDigits: z
    .string()
    .length(4, "Debe tener 4 dígitos")
    .regex(/^\d+$/, "Solo se permiten números"),
  closingDay: z.string().refine(
    (value) => {
      const number = parseInt(value);
      return !isNaN(number) && number >= 1 && number <= 31;
    },
    {
      message: "El día debe estar entre 1 y 31",
    }
  ),
  dueDay: z.string().refine(
    (value) => {
      const number = parseInt(value);
      return !isNaN(number) && number >= 1 && number <= 31;
    },
    {
      message: "El día debe estar entre 1 y 31",
    }
  ),
});

interface CreateCardDialogProps {
  onCardCreated: () => void;
}

export function CreateCardDialog({ onCardCreated }: CreateCardDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bank: "",
      creditLimit: "",
      color: "blue",
      lastFourDigits: "",
      closingDay: "",
      dueDay: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await api.post("/cards", {
        ...values,
        creditLimit: parseFloat(values.creditLimit),
        closingDay: parseInt(values.closingDay),
        dueDay: parseInt(values.dueDay),
      });

      toast({
        title: "Tarjeta creada",
        description: "La tarjeta se ha creado correctamente",
      });

      form.reset();
      setOpen(false);
      onCardCreated();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la tarjeta",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-5 w-5 mr-2" />
          Agregar Tarjeta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nueva Tarjeta</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Tarjeta</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: Visa Platinum" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: Santander" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="creditLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Límite de Crédito</FormLabel>
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
              name="lastFourDigits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Últimos 4 dígitos</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={4}
                      placeholder="1234"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 4) {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="closingDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día de Cierre</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="15"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día de Vencimiento</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color de la Tarjeta</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="blue"
                            className="bg-blue-600 border-blue-600"
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="black"
                            className="bg-gray-900 border-gray-900"
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="green"
                            className="bg-green-600 border-green-600"
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="red"
                            className="bg-red-600 border-red-600"
                          />
                        </FormControl>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Agregar Tarjeta
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
