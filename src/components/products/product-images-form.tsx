"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Plus, ImageIcon, ArrowUp } from "lucide-react";
import Image from "next/image";

interface ProductImagesFormProps {
  onComplete: (data: { files: File[] }) => void;
  existingImages?: { id: string; url: string; isMain: boolean }[];
}

export default function ProductImagesForm({ onComplete, existingImages = [] }: ProductImagesFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  
  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': []
    },
    onDrop: (acceptedFiles) => {
      // Create preview URLs
      const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
      
      // Update state
      setFiles(prev => [...prev, ...acceptedFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });
  
  // Handle image removal
  const removeImage = (index: number) => {
    // Revoke the preview URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    
    // Update state
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    
    // Update main image index if needed
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(prev => prev - 1);
    }
  };
  
  // Set an image as the main image
  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (files.length === 0) {
      alert("Please upload at least one image");
      return;
    }
    
    // Reorder files so the main image is first
    const orderedFiles = [...files];
    const mainFile = orderedFiles.splice(mainImageIndex, 1)[0];
    orderedFiles.unshift(mainFile);
    
    onComplete({ files: orderedFiles });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Upload Images</h3>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-input"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              {isDragActive ? (
                <p>Drop the images here...</p>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">Drag and drop your images here</p>
                  <p className="text-xs text-muted-foreground mb-2">PNG, JPG, WebP or GIF (max 5MB)</p>
                  <Button variant="secondary" size="sm" type="button">
                    Select Files
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium text-foreground">Tips:</span> Upload high-quality images from multiple angles.
            </p>
            <p className="text-sm text-muted-foreground">
              The first image will be the main product image.
            </p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Image Preview</h3>
          
          {previews.length === 0 ? (
            <div className="border rounded-md p-8 text-center h-[200px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previews.map((preview, index) => (
                <div 
                  key={index} 
                  className={`relative border rounded-md overflow-hidden aspect-square group ${
                    index === mainImageIndex ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    src={preview}
                    alt={`Product image ${index + 1}`}
                    className="object-cover"
                    fill
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={(e) => {
                          e.preventDefault();
                          removeImage(index);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      {index !== mainImageIndex && (
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          onClick={(e) => {
                            e.preventDefault();
                            setAsMainImage(index);
                          }}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {index === mainImageIndex && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm text-xs font-medium">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={files.length === 0}
        >
          Continue to Pricing
        </Button>
      </div>
    </div>
  );
} 