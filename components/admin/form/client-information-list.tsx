// components/admin/form/client-information-list.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientInformationData } from "@/lib/schema";

export interface ClientInformationListProps {
  data: ClientInformationData;
  onChange: (data: ClientInformationData) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof ClientInformationData, string>>;
}

export default function ClientInformationList({
  data,
  onChange,
  disabled = false,
  errors = {},
}: ClientInformationListProps) {
  
  const handleChange = (field: keyof ClientInformationData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div>
      
      
      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={disabled}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@company.com"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={disabled}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="company">
            Company <span className="text-red-500">*</span>
          </Label>
          <Input
            id="company"
            type="text"
            placeholder="Acme Inc."
            value={data.company}
            onChange={(e) => handleChange("company", e.target.value)}
            disabled={disabled}
            className={errors.company ? "border-red-500" : ""}
          />
          {errors.company && (
            <p className="text-sm text-red-600">{errors.company}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={disabled}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Hours of Operation */}
        <div className="space-y-2">
          <Label htmlFor="hours">Hours of Operation</Label>
          <Input
            id="hours"
            type="text"
            placeholder="e.g., 9am–5pm EST, Monday-Friday"
            value={data.hours}
            onChange={(e) => handleChange("hours", e.target.value)}
            disabled={disabled}
            className={errors.hours ? "border-red-500" : ""}
          />
          {errors.hours && (
            <p className="text-sm text-red-600">{errors.hours}</p>
          )}
          <p className="text-xs md:text-sm text-gray-500">
            Specify your business hours for call handling
          </p>
        </div>
      </div>
    </div>
  );
}