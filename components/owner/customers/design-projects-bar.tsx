"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Image as ImageIcon, Palette } from "lucide-react"

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export type DesignProject = {
  id: string
  name?: string
  mockups?: unknown[]
}

// ----------------------------------------------------------------------
// DesignProjectsBar
// ----------------------------------------------------------------------
export default function DesignProjectsBar({ projects }: { projects: DesignProject[] }) {
  if (!projects || projects.length === 0) return null

  return (
    <div className="space-y-3 pt-4 border-t border-gray-200/60">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider px-1 flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-400" />
        Design Projects
      </h2>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/my/design-studio/${project.id}`}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-[16px] shadow-sm hover:border-[#007AFF]/30 hover:shadow-md transition-all shrink-0 group min-w-[200px]"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-gray-900 group-hover:text-[#007AFF] transition-colors truncate">
                {project.name || "Untitled Design"}
              </span>
              <span className="text-[10px] font-medium text-gray-400">
                {project.mockups?.length || 0} Mockups Generated
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#007AFF] shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}