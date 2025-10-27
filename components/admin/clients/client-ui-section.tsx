// components/client-ui-section.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ClientUISectionProps {
  logoUrl?: string;
  splashScreenUrl?: string;
  onLogoUrlChange: (url: string) => void;
  onSplashScreenUrlChange: (url: string) => void;
  disabled?: boolean;
}

export function ClientUISection({ 
  logoUrl = "",
  splashScreenUrl = "",
  onLogoUrlChange,
  onSplashScreenUrlChange,
  disabled = false
}: ClientUISectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">UI Assets</Label>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
        >
          {isExpanded ? (
            <>
              <EyeOff className="h-4 w-4 md:mr-1" />
              <span className="hidden md:block">Hide</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 md:mr-1" />
              <span className="hidden md:block">Show</span>
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              value={logoUrl}
              onChange={(e) => onLogoUrlChange(e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={disabled}
            />
            {logoUrl && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">Logo Preview:</p>
                <div className="border rounded-lg p-4 flex justify-center">
                  <img 
                    src={logoUrl} 
                    alt="Logo preview" 
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="splashscreen-url">Splash Screen URL</Label>
            <Input
              id="splashscreen-url"
              value={splashScreenUrl}
              onChange={(e) => onSplashScreenUrlChange(e.target.value)}
              placeholder="https://example.com/splashscreen.png"
              disabled={disabled}
            />
            {splashScreenUrl && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">Splash Screen Preview:</p>
                <div className="border rounded-lg p-4 flex justify-center">
                  <img 
                    src={splashScreenUrl} 
                    alt="Splash screen preview" 
                    className="max-h-32 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}