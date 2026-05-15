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
        push(`my/design-studio/${designId}`); // use designId directly, not designProjectId state — it's still null here
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
