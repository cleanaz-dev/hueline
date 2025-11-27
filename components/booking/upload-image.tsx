// components/ImageUploadDialog.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";

interface ImageUploadDialogProps {
  bookingId: string;
  onUploadComplete?: () => void;
}

export function ImageUploadDialog({
  bookingId,
  onUploadComplete,
}: ImageUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Generate previews
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("bookingId", bookingId);

      const response = await fetch(`/api/booking/${bookingId}/upload-images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Clear state
      setFiles([]);
      setPreviews([]);
      setOpen(false);

      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="aspect-square relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 transition-all duration-200 cursor-pointer hover:border-primary hover:shadow-md flex items-center justify-center bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center gap-1">
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Upload</span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>Add more photos to your project</DialogDescription>
        </DialogHeader>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Badge
                variant="default"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-2 py-1 text-xs font-semibold"
              >
                NEW
              </Badge>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Need to add more photos?
              </p>
              <p className="text-xs text-blue-700">
                Call Hue-Line and we&apos;ll help you add new photos to your project
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">Click to upload images</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <Image
                    src={preview}
                    alt={`Preview ${index}`}
                    width={150}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length} ${
                files.length === 1 ? "Image" : "Images"
              }`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
