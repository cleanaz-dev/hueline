"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScopeItem } from "@/types/room-types";
import { AlertTriangle } from "lucide-react";

interface SowDeleteItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemToDelete: ScopeItem | null;
  onConfirm: () => void;
}

export function SowDeleteItemDialog({ 
  isOpen, 
  onOpenChange, 
  itemToDelete, 
  onConfirm 
}: SowDeleteItemDialogProps) {
  
  if (!itemToDelete) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle>Delete Scope Item?</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to remove this item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3 my-2 text-sm text-zinc-700">
          <div className="grid grid-cols-[60px_1fr] gap-2">
            <span className="font-semibold text-zinc-500 text-xs uppercase">Area:</span>
            <span className="capitalize">{itemToDelete.area}</span>
            
            <span className="font-semibold text-zinc-500 text-xs uppercase">Action:</span>
            <span>
              <span className="font-medium">{itemToDelete.action}</span> on <span className="font-medium">{itemToDelete.item}</span>
            </span>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            Delete Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}