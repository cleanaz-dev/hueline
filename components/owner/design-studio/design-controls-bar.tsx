"use client";

import { Sparkles, User, Smartphone, Mail, AlertTriangle, Phone, AtSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  customer?: { name?: string | null; phone?: string | null; email?: string | null } | null;
  deliveryMethod: "sms" | "email";
  setDeliveryMethod: (method: "sms" | "email") => void;
  removeFurniture: boolean;
  setRemoveFurniture: (val: boolean) => void;
  canGenerate: boolean;
  onGenerate: () => void;
  roomType: string;
  setRoomType: (roomType: string) => void;
}

export function DesignControlsBar({
  customer,
  deliveryMethod,
  setDeliveryMethod,
  removeFurniture,
  setRemoveFurniture,
  canGenerate,
  onGenerate,
  roomType,
  setRoomType,
}: Props) {
  const hasPhone = !!customer?.phone;
  const hasEmail = !!customer?.email;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      
      {/* Left: Customer Info */}
      <div className="flex flex-1 min-w-[200px] items-center gap-3">
        {customer ? (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900">
                  {customer.name || "Unknown Client"}
                </span>

                {/* Phone indicator */}
                <span
                  title={hasPhone ? customer.phone! : "No phone on file"}
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                    hasPhone
                      ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                      : "bg-zinc-50 text-zinc-300 ring-1 ring-zinc-100"
                  }`}
                >
                  <Phone className="h-3 w-3" />
                </span>

                {/* Email indicator */}
                <span
                  title={hasEmail ? customer.email! : "No email on file"}
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                    hasEmail
                      ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                      : "bg-zinc-50 text-zinc-300 ring-1 ring-zinc-100"
                  }`}
                >
                  <AtSign className="h-3 w-3" />
                </span>
              </div>

              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
                Client Attached
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200/50 bg-amber-50 px-4 py-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider">Test Mode</span>
              <span className="text-[10px] font-medium text-amber-600/80">No customer attached to project</span>
            </div>
          </div>
        )}
      </div>

      {/* Middle: Room Type, Delivery Method & Toggles */}
      <div className="flex items-center gap-6 border-l border-zinc-100 pl-6">
        
        {/* Room Type Select */}
        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger className="h-9 w-[150px] rounded-lg border-zinc-200 bg-zinc-50 text-xs font-bold shadow-inner focus:ring-zinc-900/10">
            <SelectValue placeholder="Room Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Room Type
              </SelectLabel>
              <SelectItem value="room" className="text-xs font-semibold cursor-pointer">
                Room
              </SelectItem>
              <SelectItem value="office" className="text-xs font-semibold cursor-pointer">
                Office
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Delivery Toggle */}
        <ToggleGroup
          type="single"
          value={deliveryMethod}
          onValueChange={(value) => {
            if (value) setDeliveryMethod(value as "sms" | "email");
          }}
          className="rounded-lg bg-zinc-100 p-1 shadow-inner h-9"
        >
          <ToggleGroupItem 
            value="sms" 
            title={customer?.phone || "No phone provided"}
            className="group relative h-7 px-3 text-xs font-bold text-zinc-500 data-[state=on]:bg-white data-[state=on]:text-zinc-900 data-[state=on]:shadow-sm transition-all"
          >
            <Smartphone className="mr-2 h-3.5 w-3.5" />
            SMS
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="email" 
            title={customer?.email || "No email provided"}
            className="group relative h-7 px-3 text-xs font-bold text-zinc-500 data-[state=on]:bg-white data-[state=on]:text-zinc-900 data-[state=on]:shadow-sm transition-all"
          >
            <Mail className="mr-2 h-3.5 w-3.5" />
            Email
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Remove Furniture Switch */}
        <div className="flex items-center space-x-2 group cursor-pointer hover:opacity-80 transition-opacity">
          <Switch 
            id="remove-furniture" 
            checked={removeFurniture}
            onCheckedChange={setRemoveFurniture}
            className="data-[state=checked]:bg-zinc-900 data-[state=unchecked]:bg-zinc-200"
          />
          <Label 
            htmlFor="remove-furniture" 
            className={`text-xs font-bold cursor-pointer transition-colors ${removeFurniture ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-700"}`}
          >
            Empty Room
          </Label>
        </div>
      </div>

      {/* Right: Generate Button */}
      <div className="flex items-center border-l border-zinc-100 pl-6">
        <Button
          disabled={!canGenerate}
          onClick={onGenerate}
          className={`h-10 rounded-xl px-6 text-sm font-bold shadow-md transition-all active:scale-[0.98] ${
            canGenerate 
              ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20" 
              : "bg-zinc-100 text-zinc-400"
          }`}
        >
          <Sparkles className={`mr-2 h-4 w-4 ${canGenerate ? "text-amber-400" : "text-zinc-300"}`} />
          Generate Portal
        </Button>
      </div>
    </div>
  );
}

