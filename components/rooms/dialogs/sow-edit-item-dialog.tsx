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
import { ScopeItem, ScopeType } from "@/types/room-types";

interface SowEditItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit: ScopeItem | null;
  onSave: (updatedItem: ScopeItem) => void;
}

export function SowEditItemDialog({ 
  isOpen, 
  onOpenChange, 
  itemToEdit, 
  onSave 
}: SowEditItemDialogProps) {
  const [area, setArea] = useState("");
  const [type, setType] = useState<ScopeType>(ScopeType.PAINT);
  const [item, setItem] = useState("");
  const [action, setAction] = useState("");

  useEffect(() => {
    if (isOpen && itemToEdit) {
      setArea(itemToEdit.area);
      setType(itemToEdit.type);
      setItem(itemToEdit.item || "");
      setAction(itemToEdit.action || "");
    }
  }, [isOpen, itemToEdit]);

  const handleSubmit = () => {
    if (!itemToEdit) return;

    const updatedItem: ScopeItem = {
      ...itemToEdit, // Keep timestamp and image_urls
      area,
      type,
      item: item,
      action: action
    };

    onSave(updatedItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Scope Item</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-area">Area / Room</Label>
            <Input 
              id="edit-area" 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              className="capitalize"
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Category</Label>
              <Select value={type as string} onValueChange={(value) => setType(value as ScopeType)}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAINT">Paint</SelectItem>
                  <SelectItem value="PREP">Prep</SelectItem>
                  <SelectItem value="REPAIR">Repair</SelectItem>
                  <SelectItem value="NOTE">Note</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-item">Item</Label>
              <Input 
                id="edit-item" 
                value={item} 
                onChange={(e) => setItem(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-action">Action / Description</Label>
            <Textarea 
              id="edit-action" 
              value={action} 
              onChange={(e) => setAction(e.target.value)} 
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}