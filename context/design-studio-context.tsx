"use client";

import { DesignProject } from "@/app/generated/prisma";
import { createContext, ReactNode, useContext, useState } from "react";
import useSWR from "swr";
import { useOwner } from "./owner-context";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DesignContext {
  designs: DesignProject[];
  isDesignsLoading: boolean;
  designsError: any;
  mutateDesigns: () => void;
  isDesignLoading: boolean;
  setIsDesignLoading: (value: boolean) => void;
  isCreatingDesignProject: boolean;
  designProjectId: string | null;
  designProject: DesignProject | undefined; // added
  createDesignProject: () => Promise<void>;
  fetchSingleDesignProject: (designId: string) => Promise<void>;
  uploadImageToDesign: (designId: string, file: File) => Promise<void>
}
const DesignStudioContext = createContext<DesignContext | undefined>(undefined);

export function DesignProvider({ children }: { children: ReactNode }) {
  const { push } = useRouter();
  const { subdomain } = useOwner();
  const API_URL = `/api/subdomain/${subdomain.slug}`;
  const {
    data: designs,
    isLoading: isDesignsLoading,
    error: designsError,
    mutate: mutateDesigns,
  } = useSWR<DesignProject[]>(
    `/api/subdomain/${subdomain.slug}/designs`,
    fetcher,
  );

  const [isDesignLoading, setIsDesignLoading] = useState<boolean>(false);
  const [isCreatingDesignProject, setIsCreatingDesignProject] =
    useState<boolean>(false);
  const [designProjectId, setDesignProjectId] = useState<string | null>(null);
  const [designProject, setDesignProject] = useState<DesignProject>();

  const createDesignProject = async () => {
    setIsCreatingDesignProject(true);
    try {
      const res = await fetch(`${API_URL}/designs/create`, {
        method: "POST",
      });
      if (res.ok) {
        const { designId } = await res.json();
        setDesignProjectId(designId);
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

  const fetchSingleDesignProject = async (designId: string) => {
    setIsDesignLoading(true);
    try {
      const res = await fetch(`${API_URL}/designs/${designId}`, {
        method: "GET",
      });
      if (res.ok) {
        const { designProject } = await res.json();
        setDesignProject(designProject);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsDesignLoading(false);
    }
  };


const uploadImageToDesign = async (designId: string, file: File) => {
  try {
    // Your API generates this using the AWS SDK, but DOES NOT process the file yet.
    const urlRes = await fetch(`${API_URL}/designs/${designId}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        filename: file.name, 
        contentType: file.type 
      }),
    });
    
    const { uploadUrl, finalImageUrl } = await urlRes.json();

    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    
    await fetch(`${API_URL}/designs/${designId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalImageUrl: finalImageUrl }),
    });

   
    setDesignProject((prev) => 
      prev ? { ...prev, originalImageUrl: finalImageUrl } : prev
    );
    await mutateDesigns();

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
        designsError,
        mutateDesigns,
        isDesignLoading,
        setIsDesignLoading,
        isCreatingDesignProject,
        designProjectId,
        designProject,        // added
        createDesignProject,
        fetchSingleDesignProject,
        uploadImageToDesign
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
