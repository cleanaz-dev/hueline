"use client";

import { useBooking } from "@/context/booking-context";
import { getPublicUrl } from "@/lib/aws/cdn";
import { Download, CheckCircle, Clock, XCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ExportData {
  status: "complete" | "processing" | "failed";
  download_url?: string;
  job_id: string;
  slug: string;
  huelineId: string;
  image_count?: number;
  completed_at?: string;
  error?: string;
}

interface ClientDownloadPageProps {
  data: ExportData;
}

export default function ClientDownloadPage({ data }: ClientDownloadPageProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { subdomain } = useBooking();

  const handleDownload = async () => {
    if (!data.download_url) return;

    setIsDownloading(true);
    try {
      window.location.href = data.download_url;
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  const logoSrc = getPublicUrl(subdomain.logo) || "/placeholder.png";

  // Status: Complete
  if (data.status === "complete" && data.download_url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="flex-shrink-0 relative h-16 w-32 md:w-56 mb-6">
            <Image src={logoSrc} fill className="object-contain" alt="logo" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Export Ready!
              </h1>
              <p className="text-gray-600">
                Your {data.image_count || 0} high-resolution images are ready to
                download
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 mb-4 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              {isDownloading ? "Downloading..." : "Download Images"}
            </button>

            <div className="text-sm text-gray-500 space-y-1">
              <p>Job ID: {data.job_id}</p>
              {data.completed_at && (
                <p>Completed: {new Date(data.completed_at).toLocaleString()}</p>
              )}
              <p className="text-xs mt-3">⏰ This download link expires in 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status: Processing
  if (data.status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing...</h1>
            <p className="text-gray-600">
              Your export is being processed. Please check back in a few moments.
            </p>

            <div className="text-sm text-gray-500 mt-6">
              <p>Job ID: {data.job_id}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status: Failed
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Failed</h1>
          <p className="text-gray-600">
            {data.error || "Something went wrong processing your export."}
          </p>

          <div className="text-sm text-gray-500 mt-6">
            <p>Job ID: {data.job_id}</p>
            <p className="mt-4 text-gray-700">
              Please try exporting again or contact support if the issue persists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
