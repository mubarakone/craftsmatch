"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Paperclip, X, FileIcon, ImageIcon, FileTextIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { attachmentSchema } from "@/lib/validators/message";

interface AttachmentUploadProps {
  onAttachmentsChange: (files: File[]) => void;
  attachments: File[];
  disabled?: boolean;
}

export default function AttachmentUpload({
  onAttachmentsChange,
  attachments,
  disabled = false,
}: AttachmentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    // Validate files
    files.forEach((file) => {
      try {
        attachmentSchema.parse({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
        validFiles.push(file);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`${file.name}: ${error.message}`);
        } else {
          errors.push(`${file.name}: Invalid file`);
        }
      }
    });

    // Complete upload process (simulation)
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

      // Handle validation errors
      if (errors.length > 0) {
        toast({
          title: "Some files couldn't be uploaded",
          description: (
            <ul className="text-sm list-disc pl-4 mt-2 space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          ),
          variant: "destructive",
        });
      }

      // Update attachments with valid files
      if (validFiles.length > 0) {
        onAttachmentsChange([...attachments, ...validFiles]);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1500);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    onAttachmentsChange(newAttachments);
  };

  const renderFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.includes("pdf") || fileType.includes("document")) {
      return <FileTextIcon className="h-4 w-4" />;
    } else {
      return <FileIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
        disabled={disabled || isUploading}
      />

      {/* Attachment button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
      >
        <Paperclip className="h-4 w-4 mr-2" />
        Attach files
      </Button>

      {/* Upload progress */}
      {isUploading && (
        <div className="mt-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Uploading files... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium">Attachments ({attachments.length})</p>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted p-2 rounded-md text-xs max-w-full"
              >
                <div className="flex-shrink-0">
                  {renderFileIcon(file.type)}
                </div>
                <span className="truncate max-w-[120px]" title={file.name}>
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1"
                  onClick={() => removeAttachment(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 