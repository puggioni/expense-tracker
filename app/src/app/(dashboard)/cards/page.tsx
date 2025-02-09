"use client";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { CardList } from "@/components/cards/card-list";

export default function CardsPage() {
  return (
    <AuthenticatedLayout>
      <div className="container py-6">
        <CardList />
      </div>
    </AuthenticatedLayout>
  );
}
