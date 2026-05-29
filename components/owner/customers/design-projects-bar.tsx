"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Image as ImageIcon, Sparkles } from "lucide-react"

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export type Mockup = {
  id: string
  hex?: string
  compressedS3Key?: string
}

export type DesignProject = {
  id: string
  name?: string
  compressedImageS3Key?: string
  mockups?: Mockup[]
}

// ----------------------------------------------------------------------
// DesignProjectsBar
// ----------------------------------------------------------------------
export default function DesignProjectsBar({ projects }: { projects: DesignProject[] }) {
  if (!projects || projects.length === 0) return null

  return (
    <div className="w-full space-y-4">
      
      {/* Header Row */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Design Projects
        </h2>
      </div>

      {/* Projects List */}
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/my/design-studio/${project.id}`}
            className="flex items-center p-3 sm:p-4 bg-white border border-gray-100 rounded-[20px] shadow-sm hover:border-[#007AFF]/30 hover:shadow-md transition-all group w-full gap-4"
          >
            
            {/* 1. Overlapping Thumbnails */}
            <div className="flex items-center shrink-0">
              {/* Original Space */}
              <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg border-2 border-white bg-gray-50 shadow-sm flex items-center justify-center relative overflow-hidden z-[1]">
                <ImageIcon className="w-5 h-5 text-gray-300" />
                {project.compressedImageS3Key && (
                  <img 
                    src={`${project.compressedImageS3Key}`} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
              </div>

              {/* Top Mockup Images / Colors */}
              {project.mockups?.slice(0, 3).map((m, idx) => (
                <div 
                  key={m.id} 
                  className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg border-2 border-white shadow-sm overflow-hidden relative"
                  style={{ 
                    zIndex: idx + 2, 
                    marginLeft: '-1rem', // Creates the overlap effect
                    backgroundColor: m.hex || '#f3f4f6' 
                  }}
                >
                  {m.compressedS3Key && (
                    <img 
                      src={`${m.compressedS3Key}`} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* 2. Title & Info */}
            <div className="flex flex-col flex-1 min-w-0 px-2">
              <span className="text-sm font-bold text-gray-900 group-hover:text-[#007AFF] transition-colors truncate">
                {project.name || "Untitled Design"}
              </span>
              <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                {project.mockups?.length || 0} Mockups Generated
              </span>
            </div>

            {/* 3. Action Icon */}
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#007AFF]/10 shrink-0">
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#007AFF]" />
            </div>

          </Link>
        ))}
      </div>
    </div>
  )
}