import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, FileCode } from "lucide-react";
import { toast } from "sonner";

interface CodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

export function CodeViewer({ isOpen, onClose, code }: CodeViewerProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Python code copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-xl max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            Generated Agent Code (Python)
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-4 overflow-auto relative group">
          <Button 
            size="sm" 
            variant="secondary" 
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-2" /> Copy
          </Button>
          <pre className="text-xs font-mono text-green-400 leading-relaxed">
            {code}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}