// components/subdomains/layout/client-download-page.tsx
"use client";

import { useBooking } from "@/context/booking-context";
import {
  Download,
  CheckCircle,
  Clock,
  XCircle,
  FileArchive,
} from "lucide-react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import type { Export } from "@/types/subdomain-type";
import SubdomainNav from "./subdomain-nav";

export default function ClientDownloadPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { subdomain, booking, isLoading } = useBooking();

  const handleDownload = async (downloadUrl: string, exportId: string) => {
    if (!downloadUrl) return;

    setDownloadingId(exportId);
    try {
      window.location.href = downloadUrl;
    } finally {
      setTimeout(() => setDownloadingId(null), 2000);
    }
  };

  const exports: Export[] = booking?.exports || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3.5 h-3.5" />
            Ready
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Processing
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "N/A";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (date?: Date | string | null) => {
    if (!date) return "";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, "h:mm a");
    } catch {
      return "";
    }
  };

  const formatTimeAgo = (date?: Date | string | null) => {
    if (!date) return "N/A";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return formatDistanceToNow(dateObj);
    } catch {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading exports...</div>
      </div>
    );
  }

  if (!booking || !subdomain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No booking data found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SubdomainNav data={subdomain} miniNav={false} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Downloads
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            View and download your exported high-resolution images
          </p>
        </div>

        {/* Empty State */}
        {exports.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileArchive className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              No exports yet
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Export your images from the booking page to see them here
            </p>
          </div>
        )}

        {/* Exports List */}
        {exports.length > 0 && (
          <div className="space-y-4">
            {exports.map((exportItem) => (
              <div
                key={exportItem.id}
                className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Export Info */}
                  <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileArchive className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {exportItem.resolution?.toUpperCase() || "UNKNOWN"}{" "}
                          Export
                        </h3>
                        {exportItem.status && getStatusBadge(exportItem.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
                        <span>{exportItem.imageCount || 0} images</span>
                        <span className="text-gray-300">•</span>
                        <span>
                          {formatDate(exportItem.createdAt)}
                          {exportItem.createdAt && (
                            <span className="ml-1 text-gray-500">
                              at {formatTime(exportItem.createdAt)}
                            </span>
                          )}
                        </span>
                        {exportItem.completedAt && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-green-600">
                              {formatTimeAgo(exportItem.completedAt)}{""} ago
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex-shrink-0">
                    {exportItem.status === "complete" &&
                    exportItem.downloadUrl ? (
                      <button
                        onClick={() =>
                          handleDownload(exportItem.downloadUrl!, exportItem.id)
                        }
                        disabled={downloadingId === exportItem.id}
                        className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        {downloadingId === exportItem.id
                          ? "Downloading..."
                          : "Download"}
                      </button>
                    ) : exportItem.status === "processing" ? (
                      <div className="flex items-center gap-2 text-sm text-blue-600 py-2.5 px-5">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>Processing...</span>
                      </div>
                    ) : exportItem.status === "failed" ? (
                      <div className="flex items-center gap-2 text-sm text-red-600 py-2.5 px-5">
                        <XCircle className="w-4 h-4" />
                        <span>Failed</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 py-2.5 px-5">
                        Unknown status
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}