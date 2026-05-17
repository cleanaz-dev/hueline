"use client";

import { Customer, DesignProject } from "@/app/generated/prisma";
import { createContext, ReactNode, useContext, useState } from "react";
import useSWR from "swr";
import { useOwner } from "./owner-context";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DesignContext {
  designs: DesignProject[];
  isDesignsLoading: boolean;
  isCreatingDesignProject: boolean;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (value: Customer | null) => void;
  createDesignProject: () => Promise<void>;
  uploadImageToDesign: (designId: string, file: File) => Promise<string>; // 🟢 Note the return type!
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const createDesignProject = async () => {
    setIsCreatingDesignProject(true);
    try {
      const res = await fetch(`${API_URL}/designs/create`, {
        method: "POST",
      });
      if (res.ok) {
        const { designId } = await res.json();
        await mutateDesigns();
        push(`/design-studio/${designId}`); // use designId directly, not designProjectId state — it's still null here
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
