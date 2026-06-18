"use client";

import { motion } from "framer-motion";
import { PhoneCall, Loader2, Headphones } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // <-- Added Input component
import { useOwner } from "@/context/owner-context";

interface DialChannelInputProps {
  customerPhoneNumber: string;
  setCustomerPhoneNumber: (val: string) => void;
  operatorNumber: string;
  setOperatorNumber: (val: string) => void;
  activeThreadPhone?: string;
  isLoading: boolean;
}

export function DialChannelInput({
  customerPhoneNumber,
  setCustomerPhoneNumber,
  operatorNumber,
  setOperatorNumber,
  activeThreadPhone,
  isLoading,
}: DialChannelInputProps) {
  const { me, isMeLoading } = useOwner();

  return (
    <motion.div
      key="dial"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="w-full min-h-20 p-3 flex flex-col justify-center gap-4"
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <PhoneCall size={12} /> Target Customer Phone
        </span>
        <Select
          value={customerPhoneNumber || activeThreadPhone || ""}
          onValueChange={(val) => setCustomerPhoneNumber(val)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full h-9 px-3 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 cursor-pointer">
            <SelectValue placeholder="No phone numbers found" />
          </SelectTrigger>
          <SelectContent>
            {activeThreadPhone ? (
              <SelectItem value={activeThreadPhone}>
                {activeThreadPhone}
              </SelectItem>
            ) : (
              <SelectItem value="none" disabled>
                No phone numbers found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Headphones size={12} /> Operator Conference Line
        </span>
        {isMeLoading ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Input
            value={operatorNumber}
            onChange={(e) => setOperatorNumber(e.target.value)}
            placeholder="Operator phone number..."
            disabled={isLoading}
            className="w-full h-9 px-3 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-md"
          />
        )}
      </div>
    </motion.div>
  );
}