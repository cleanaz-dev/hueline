"use client";

import { createContext, useContext, ReactNode } from "react";
import { 
  SubdomainAccountData, 
  Call, 
  Log 
} from "@/types/subdomain-type"; // Adjust path to where you saved your interfaces

// 1. Extend the base interface to include what you are fetching in layout.tsx
// Your layout.tsx includes: callFlows, intelligence, logs, users, calls
interface OwnerContextValue {
  subdomain: SubdomainAccountData & {
    calls: Call[];
    logs: Log[];
  };
}

const OwnerContext = createContext<OwnerContextValue | null>(null);

export function OwnerProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: OwnerContextValue;
}) {
  return (
    <OwnerContext.Provider value={value}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error("useOwner must be used within an OwnerProvider");
  }
  return context;
}