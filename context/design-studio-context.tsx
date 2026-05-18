"use client";

import { Customer, DesignProject } from "@/app/generated/prisma";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import useSWR from "swr";
import { useOwner } from "./owner-context";
import { useRouter } from "next/navigation";
import { PaintColor } from "@/lib/desing-studio-config";

const fetcher = (url: string) => fetch(url).then((res) => res.json());


interface GeneratePayload {
  designId: string;
  deliveryMethod: "sms" | "email";
  selectedColor: PaintColor | null;
  removeFurniture: boolean;
  customerId?: string | null;
  roomType: string;
}



interface DesignContext {
  designs: DesignProject[];
  isDesignsLoading: boolean;
  isCreatingDesignProject: boolean;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (value: Customer | null) => void;
  createDesignProject: (payload: {
    customerMode: "existing" | "new";
    customerId?: string;
    newCustomer?: { name: string; phone: string; email: string };
  }) => Promise<void>;
  uploadImageToDesign: (designId: string, file: File) => Promise<string>;

  // Generate
  isGeneratingProjectImage: boolean;
  setIsGeneratingProjectImage: (val: boolean) => void;
  generateDesignProjectImage: (payload: GeneratePayload) => Promise<void>;
}

const DesignStudioContext = createContext<DesignContext | undefined>(undefined);

export function DesignProvider({ children }: { children: ReactNode }) {
  const { push } = useRouter();
  const { subdomain } = useOwner();
  const API_URL = `/api/subdomain/${subdomain.slug}`;

  const {
    data: designs,
    isLoading: isDesignsLoading,
    mutate: mutateDesigns,
  } = useSWR<DesignProject[]>(`${API_URL}/designs`, fetcher, {
    refreshInterval: 30 * 60 * 1000,
  });

  const [isCreatingDesignProject, setIsCreatingDesignProject] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isGeneratingProjectImage, setIsGeneratingProjectImage] = useState(false);

  const createDesignProject = async (payload: {
    customerMode: "existing" | "new";
    customerId?: string;
    newCustomer?: { name: string; phone: string; email: string };
  }) => {
    setIsCreatingDesignProject(true);
    try {
      const res = await fetch(`${API_URL}/designs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // 🟢 Added headers so JSON parses correctly on the backend
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const { designId } = await res.json();
        await mutateDesigns();
        // Adjust this route to match your structure (e.g. `/my/design-studio/...` if applicable)
        push(`/my/design-studio/${designId}`); 
      } else {
        throw new Error("Failed to create design project");
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsCreatingDesignProject(false);
    }
  };

  const uploadImageToDesign = async (
    designId: string,
    file: File,
  ): Promise<string> => {
    try {
      const urlRes = await fetch(`${API_URL}/designs/${designId}/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      const { uploadUrl, s3Key } = await urlRes.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await fetch(`${API_URL}/designs/${designId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalImageS3Key: s3Key }),
      });

      // Update the global list of designs in the background
      await mutateDesigns();

      // Return the key so the component calling this can update itself!
      return s3Key;
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw error;
    }
  };

 const generateDesignProjectImage = useCallback(
    async (payload: GeneratePayload): Promise<void> => {
      const { designId, deliveryMethod, selectedColor, removeFurniture, customerId, roomType } = payload;

      if (!selectedColor) throw new Error("No color selected");

      setIsGeneratingProjectImage(true);

      try {
        const res = await fetch(
          `/api/subdomain/${subdomain.slug}/designs/${designId}/generate-image`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deliveryMethod,
              removeFurniture,
              customerId,
              roomType,
              color: {
                brand: selectedColor.brand,
                name: selectedColor.name,
                hex: selectedColor.hex,
                code: selectedColor.code,
              },
            }),
          }
        );

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.message || "Generation failed");
        }

        const data = await res.json();
        return data;
      } finally {
        setIsGeneratingProjectImage(false);
      }
    },
    [subdomain.slug]
  );

  return (
    <DesignStudioContext.Provider
      value={{
        designs: designs ?? [],
        isDesignsLoading,
        isCreatingDesignProject,
        selectedCustomer,
        setSelectedCustomer,
        createDesignProject,
        uploadImageToDesign,
        generateDesignProjectImage,
        isGeneratingProjectImage,
        setIsGeneratingProjectImage
      }}
    >
      {children}
    </DesignStudioContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignStudioContext);
  if (!context)
    throw new Error("useDesign must be used within a DesignProvider");
  return context;
}