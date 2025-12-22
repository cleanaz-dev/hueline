"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Subdomain {
  slug: string;
  companyName: string;
}

interface SubdomainSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function SubdomainSelector({ value, onChange }: SubdomainSelectorProps) {
  const [open, setOpen] = useState(false);

  // ✅ Fetch real data with SWR
  const { data: subdomains, isLoading, error } = useSWR<Subdomain[]>(
    '/api/subdomain',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between h-9 bg-white"
          disabled={isLoading}
        >
          {isLoading ? (
            "Loading..."
          ) : value ? (
            subdomains?.find((sub) => sub.slug === value)?.companyName || "Select Client..."
          ) : (
            "Select Client..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>
              {error ? "Error loading clients" : "No client found."}
            </CommandEmpty>
            <CommandGroup>
              {subdomains?.map((sub) => (
                <CommandItem
                  key={sub.slug}
                  value={sub.slug}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === sub.slug ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{sub.companyName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {sub.slug}.hue-line.com
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}