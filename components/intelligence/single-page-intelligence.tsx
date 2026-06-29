"use client"

import { Intelligence } from "@/app/generated/prisma";

export function SinglePageIntelligence({ intelligence }: { intelligence: Intelligence }) {
  return (
    <div>
      <h1>Intelligence ID: {intelligence.id}</h1>
    </div>
  );

}
