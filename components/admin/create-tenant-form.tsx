"use client";

import { createTenant } from "@/lib/actions/create-tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateTenantForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createTenant(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Partner onboarded successfully!");
      // Optional: Reset form via ref or simple reload
      // window.location.reload(); 
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label>Company Name</Label>
        <Input name="companyName" placeholder="Joe's Painting" required />
      </div>
      
      <div>
        <Label>Subdomain Slug</Label>
        <div className="flex items-center">
          <Input name="slug" placeholder="joes-painting" required className="rounded-r-none" />
          <div className="bg-gray-100 border border-l-0 border-gray-200 px-3 py-2 text-sm text-gray-500 rounded-r-md">
            .hue-line.com
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Owner Account</h3>
        <div className="space-y-3">
          <div>
            <Label>Full Name</Label>
            <Input name="ownerName" placeholder="Joe Smith" required />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="joe@example.com" required />
          </div>
          <div>
            <Label>Password</Label>
            <Input name="password" type="password" required />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-4">
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Partner"}
      </Button>
    </form>
  );
}