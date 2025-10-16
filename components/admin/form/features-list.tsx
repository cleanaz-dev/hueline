"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FeaturesData {
  twilioNumber: string;
  crm: string;
  transferNumber?: string;
  subDomain: string;
  voiceGender: "male" | "female";
  voiceName: string;
}

interface FeaturesListProps {
  data: FeaturesData;
  onChange: (data: FeaturesData) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof FeaturesData, string>>;
}

export default function FeaturesList({
  data,
  onChange,
  disabled = false,
  errors = {},
}: FeaturesListProps) {
  const updateField = <K extends keyof FeaturesData>(
    field: K,
    value: FeaturesData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="">
      <header className="mb-2 md:mb-4">
        <h1 className="text-xl text-blue-950 font-bold">Project Features & Configuration</h1>
      </header>
      <div className="space-y-6">
        {/* Twilio Number */}
        <div className="space-y-2">
          <Label htmlFor="twilioNumber">
            Twilio Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="twilioNumber"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={data.twilioNumber}
            onChange={(e) => updateField("twilioNumber", e.target.value)}
            disabled={disabled}
            className={errors.twilioNumber ? "border-red-500" : ""}
          />
          {errors.twilioNumber && (
            <p className="text-sm text-red-600">{errors.twilioNumber}</p>
          )}
        </div>

        {/* CRM Integration */}
        <div className="space-y-2">
          <Label htmlFor="crm">
            CRM Integration <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.crm}
            onValueChange={(value) => updateField("crm", value)}
            disabled={disabled}
          >
            <SelectTrigger className={errors.crm ? "border-red-500" : ""}>
              <SelectValue placeholder="Select CRM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salesforce">Salesforce</SelectItem>
              <SelectItem value="hubspot">HubSpot</SelectItem>
              <SelectItem value="zoho">Zoho CRM</SelectItem>
              <SelectItem value="pipedrive">Pipedrive</SelectItem>
              <SelectItem value="custom">Custom/Other</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
          {errors.crm && <p className="text-sm text-red-600">{errors.crm}</p>}
        </div>

        {/* Transfer Number */}
        <div className="space-y-2">
          <Label htmlFor="transferNumber">Call Transfer Number</Label>
          <Input
            id="transferNumber"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.transferNumber || ""}
            onChange={(e) => updateField("transferNumber", e.target.value || undefined)}
            disabled={disabled}
          />
          <p className="text-sm text-gray-500">
            Optional: Number to transfer calls to
          </p>
        </div>

        {/* Subdomain */}
        <div className="space-y-2">
          <Label htmlFor="subDomain">
            Subdomain <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="subDomain"
              type="text"
              placeholder="mycompany"
              value={data.subDomain}
              onChange={(e) =>
                updateField("subDomain", e.target.value.toLowerCase())
              }
              disabled={disabled}
              className={errors.subDomain ? "border-red-500 flex-1" : "flex-1"}
            />
            <span className="text-gray-500">.hue-line.com</span>
          </div>
          {errors.subDomain && (
            <p className="text-sm text-red-600">{errors.subDomain}</p>
          )}
        </div>

        {/* Voice AI Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg">Voice AI Settings</h3>

          {/* Voice Gender */}
          <div className="space-y-2">
            <Label htmlFor="voiceGender">
              Voice Gender <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.voiceGender}
              onValueChange={(value: "male" | "female") =>
                updateField("voiceGender", value)
              }
              disabled={disabled}
            >
              <SelectTrigger className={errors.voiceGender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select voice gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.voiceGender && (
              <p className="text-sm text-red-600">{errors.voiceGender}</p>
            )}
          </div>

          {/* Voice Name */}
          <div className="space-y-2">
            <Label htmlFor="voiceName">
              Voice Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="voiceName"
              type="text"
              placeholder="e.g., Sarah, Alex, Jordan"
              value={data.voiceName}
              onChange={(e) => updateField("voiceName", e.target.value)}
              disabled={disabled}
              className={errors.voiceName ? "border-red-500" : ""}
            />
            {errors.voiceName && (
              <p className="text-sm text-red-600">{errors.voiceName}</p>
            )}
            <p className="text-sm text-gray-500">
              The name your AI assistant will introduce itself as
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}