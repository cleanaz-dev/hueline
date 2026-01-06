"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScopeItem } from "../room-details-tab-sow"; 
import { cn } from "@/lib/utils"; // Ensure you have utils or use standard class strings

interface SowAddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialArea?: string; 
  initialCategory?: string; 
  isAreaLocked?: boolean; // <--- NEW PROP
  onSave: (newItem: ScopeItem) => void;
}

export function SowAddItemDialog({ 
  isOpen, 
  onOpenChange, 
  initialArea, 
  initialCategory, 
  isAreaLocked = false, // Default to false
  onSave 
}: SowAddItemDialogProps) {
  const [area, setArea] = useState("");
  const [type, setType] = useState("PAINT");
  const [item, setItem] = useState("");
  const [action, setAction] = useState("");

  useEffect(() => {
    if (isOpen) {
      setArea(initialArea || "");
      setType(initialCategory || "PAINT");
      setItem("");
      setAction("");
    }
  }, [isOpen, initialArea, initialCategory]);

  const handleSubmit = () => {
    if (!area || !item || !action) return;
    
    const newItem: ScopeItem = {
      type,
      area: area.toLowerCase(),
      item: item.toLowerCase(),
      action: action.toLowerCase(),
      timestamp: new Date().toISOString(),
      image_url: null
    };

    onSave(newItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Scope Item</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Area Input */}
          <div className="grid gap-2">
            <Label htmlFor="area">Area / Room</Label>
            <Input 
              id="area" 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              placeholder="e.g. Basement Bedroom"
              className={cn(
                "capitalize",
                isAreaLocked && "bg-zinc-100 text-zinc-500 cursor-not-allowed"
              )}
              disabled={isAreaLocked} // <--- DISABLE INPUT IF LOCKED
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Category</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAINT">Paint</SelectItem>
                  <SelectItem value="PREP">Prep</SelectItem>
                  <SelectItem value="REPAIR">Repair</SelectItem>
                  <SelectItem value="NOTE">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item">Item</Label>
              <Input 
                id="item" 
                value={item} 
                onChange={(e) => setItem(e.target.value)} 
                placeholder="e.g. Walls"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="action">Action / Description</Label>
            <Textarea 
              id="action" 
              value={action} 
              onChange={(e) => setAction(e.target.value)} 
              placeholder="e.g. Sand walls and paint two coats"
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!area || !item || !action}>
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}