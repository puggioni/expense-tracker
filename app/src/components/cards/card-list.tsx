"use client";

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CreateCardDialog } from "./create-card-dialog";
import { CardDetails } from "./card-details";
import api from "@/lib/api/axios";
import { Card } from "@/lib/types";
interface CardListProps {
  selectedCard: Card | null;
  onCardSelect: Dispatch<SetStateAction<Card | null>>;
  refreshTrigger: number;
  onRefresh: () => void;
}

export function CardList({
  selectedCard,
  onCardSelect,
  refreshTrigger,
  onRefresh,
}: CardListProps) {
  const { toast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    fetchCards();
  }, [refreshTrigger]);

  async function fetchCards() {
    try {
      const response = await api.get<Card[]>("/cards");
      setCards(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las tarjetas",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Tarjetas</h2>
        <CreateCardDialog onCardCreated={fetchCards} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`p-6 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105 ${
              card.color === "blue"
                ? "bg-blue-600"
                : card.color === "black"
                  ? "bg-gray-900"
                  : card.color === "green"
                    ? "bg-green-600"
                    : "bg-red-600"
            }`}
            onClick={() => onCardSelect(card)}
          >
            <div className="text-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">{card.bank}</span>
                <div className="w-12 h-8 bg-white/10 rounded" />
              </div>
              <h3 className="text-xl font-bold mb-2">{card.name}</h3>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm opacity-80">
                    •••• {card.lastFourDigits}
                  </p>
                  <div className="flex gap-4 text-sm opacity-80">
                    <span>Cierre: {card.closingDay}</span>
                    <span>Venc: {card.dueDay}</span>
                  </div>
                </div>
                <p className="text-sm opacity-80">
                  Límite disponible ${card.creditLimit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <CardDetails
          card={selectedCard}
          onClose={() => onCardSelect(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
