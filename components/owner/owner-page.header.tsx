// components/OwnerPageHeader.tsx
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button'; // adjust import to your Button component

interface OwnerPageHeaderProps {
  /** The main heading (e.g., "Customers") */
  title: string;
  /** Subtext displayed below the title */
  description: string;
  /** Icon shown in the left decorative box (optional) */
  icon?: React.ReactNode;
  /** Total count to display, if any (e.g., customers.length) */
  count?: number;
  /** Label for the count (e.g., "Customers") */
  countLabel?: string;
  /** Icon inside the count badge (defaults to Users) */
  countIcon?: React.ReactNode;
  /** Callback when the action button is clicked */
  onAddClick?: () => void;
  /** Text for the action button */
  addButtonLabel?: string;
}

export default function OwnerPageHeader({
  title,
  description,
  icon,
  count,
  countLabel,
  countIcon = <Users className="w-4 h-4 text-zinc-500" />,
  onAddClick,
  addButtonLabel = 'Add',
}: OwnerPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-5 mb-8">
      {/* Left side: Icon + Title/Description */}
      <div className="flex items-center gap-4">
        {icon && (
          <div className="hidden md:flex w-14 h-14 rounded-2xl border border-zinc-200 bg-zinc-100 items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {title}
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-xl">
            {description}
          </p>
        </div>
      </div>

      {/* Right side: Count badge + Action button */}
      <div className="flex items-center gap-3">
        {count !== undefined && countLabel && (
          <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm">
            {countIcon}
            <span className="text-sm font-medium text-zinc-700">
              {count} {countLabel}
            </span>
          </div>
        )}
        {onAddClick && (
          <Button className="rounded-xl" onClick={onAddClick}>
            {addButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
