"use client";

import { useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { CardList } from "@/components/cards/card-list";
import { Card } from "@/lib/types";

export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AuthenticatedLayout>
      <div className="container py-6">
        <CardList
          selectedCard={selectedCard}
          onCardSelect={setSelectedCard}
          refreshTrigger={refreshTrigger}
          onRefresh={handleRefresh}
        />
      </div>
    </AuthenticatedLayout>
  );
}
