"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

// The shape of the data we return from our API
interface TwilioNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
}

interface TwilioNumberSelectorProps {
  onSelect: (phoneNumber: string) => void;
}

export default function TwilioNumberSelector({
  onSelect,
}: TwilioNumberSelectorProps) {
  const [areaCode, setAreaCode] = useState("");
  const [country, setCountry] = useState("US");
  const [isLoading, setIsLoading] = useState(false);
  const [numbers, setNumbers] = useState<TwilioNumber[]>([]);
  const [error, setError] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");

  const handleSearch = async () => {
    // Basic validation
    if (areaCode.length < 3) {
      setError("Please enter a valid 3-digit area code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setNumbers([]);
    setSelectedNumber("");

    try {
      const res = await fetch(
        `/api/admin/twilio/search?areaCode=${areaCode}&country=${country}`,
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch numbers.");

      if (data.numbers.length === 0) {
        throw new Error("No numbers found for this area code. Try another.");
      }

      setNumbers(data.numbers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (num: string) => {
    setSelectedNumber(num);
    onSelect(num); // Passes the chosen number up to your main form
  };

  return (
    <div className="p-5 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Routing Number</h3>
        <p className="text-sm text-gray-500">
          Search for a local number that the client will forward their calls to.
        </p>
      </div>

      {/* SEARCH INPUTS */}
      <div className="flex gap-2">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="US">🇺🇸 US</option>
          <option value="CA">🇨🇦 CA</option>
        </select>

        <input
          type="text"
          placeholder="Area Code (e.g. 416)"
          value={areaCode}
          // Forces only numbers, max 3 digits
          onChange={(e) =>
            setAreaCode(e.target.value.replace(/\D/g, "").slice(0, 3))
          }
          className="border border-gray-300 p-2 rounded-md flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />

        <Button
          type="button"
          onClick={handleSearch}
          disabled={isLoading || areaCode.length < 3}
          variant="secondary"
          size="lg"
        >
          {isLoading ? <Spinner className="size-4 animate-spin " /> : "Search"}
        </Button>
      </div>

      {/* ERROR MESSAGE */}
      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      {/* RESULTS LIST */}
      {numbers.length > 0 && (
        <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2">
          <label className="text-sm font-medium text-gray-700">
            Available Numbers:
          </label>
          <div className="grid gap-2">
            {numbers.map((num) => (
              <label
                key={num.phoneNumber}
                className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-all ${
                  selectedNumber === num.phoneNumber
                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="twilioNumber"
                    value={num.phoneNumber}
                    checked={selectedNumber === num.phoneNumber}
                    onChange={() => handleSelect(num.phoneNumber)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">
                    {num.friendlyName}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {num.locality}, {num.region}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
