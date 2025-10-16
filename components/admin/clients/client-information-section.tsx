import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ClientInformationSectionProps {
  data: {
    name: string;
    email: string;
    company: string;
    phone?: string;
    features: string[];
    hours?: string;
  };
  onDataChange: (updates: Partial<{
    name: string;
    email: string;
    company: string;
    phone?: string;
    features: string[];
    hours?: string;
  }>) => void;
  disabled?: boolean;
}

export function ClientInformationSection({
  data,
  onDataChange,
  disabled = false
}: ClientInformationSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  const updateFeature = (index: number, value: string): void => {
    const updated = [...data.features];
    updated[index] = value;
    onDataChange({ features: updated });
  };

  const addFeature = (): void => {
    onDataChange({ features: [...data.features, ""] });
  };

  const removeFeature = (index: number): void => {
    const updated = data.features.filter((_, i) => i !== index);
    onDataChange({ features: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-medium">Information</h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          {isVisible ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="hidden md:inline">Hide</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="hidden md:inline">Show</span>
            </>
          )}
        </Button>
      </div>

      {isVisible && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => onDataChange({ name: e.target.value })}
              placeholder="John Doe"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={data.email}
              onChange={(e) => onDataChange({ email: e.target.value })}
              placeholder="john@company.com"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={data.company}
              onChange={(e) => onDataChange({ company: e.target.value })}
              placeholder="Acme Inc."
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone ?? ""}
              onChange={(e) => onDataChange({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Features</Label>
            <div className="space-y-3">
              {data.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="e.g., Voice AI integration"
                    disabled={disabled}
                    className="flex-1"
                  />
                  {data.features.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="link"
              onClick={addFeature}
              disabled={disabled}
              className="px-0"
            >
              + Add another feature
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Preferred Contact Hours</Label>
            <Input
              id="hours"
              value={data.hours ?? ""}
              onChange={(e) => onDataChange({ hours: e.target.value })}
              placeholder="e.g., 9am–5pm EST"
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
}