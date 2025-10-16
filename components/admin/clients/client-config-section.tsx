import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ClientConfig {
  twilioNumber?: string;
  crm?: string;
  transferNumber?: string;
  subDomain?: string;
  voiceGender?: string;
  voiceName?: string;
  [key: string]: string | undefined; // Add index signature
}

interface ClientConfigSectionProps {
  config?: ClientConfig;
  onConfigChange: (config: ClientConfig) => void;
  disabled?: boolean;
}

export function ClientConfigSection({ 
  config, 
  onConfigChange, 
  disabled = false 
}: ClientConfigSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Convert config object to editable array
  const configEntries = config ? Object.entries(config) : [];

  const updateConfigValue = (key: string, value: string): void => {
    const updatedConfig = { ...config, [key]: value };
    onConfigChange(updatedConfig);
  };

  const addConfigField = (): void => {
    const newKey = `new_field_${Date.now()}`;
    const updatedConfig = { ...config, [newKey]: "" };
    onConfigChange(updatedConfig);
  };

  const removeConfigField = (key: string): void => {
    const updatedConfig = { ...config };
    delete updatedConfig[key];
    onConfigChange(updatedConfig);
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Configuration</Label>
        
        <div className="flex items-center gap-2">
          {isExpanded && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addConfigField}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          )}
          
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
      </div>
      
      {isExpanded && (
        <div className="space-y-3">
          {configEntries.map(([key, value]) => (
            <div key={key} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  value={key}
                  placeholder="Field name"
                  disabled={true}
                  className="bg-muted"
                />
                <Input
                  value={String(value || '')}
                  onChange={(e) => updateConfigValue(key, e.target.value)}
                  placeholder="Field value"
                  disabled={disabled}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeConfigField(key)}
                disabled={disabled}
                className="mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {configEntries.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
              No configuration fields added
            </div>
          )}
        </div>
      )}
    </div>
  );
}