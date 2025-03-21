import { useState } from "react";
import Image from "next/image";

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isMain: boolean;
  displayOrder: number;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    images.find(img => img.isMain) || images[0] || null
  );
  
  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {selectedImage ? (
          <Image
            src={selectedImage.imageUrl}
            alt={selectedImage.altText || productName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square bg-gray-100 rounded-md overflow-hidden ${
                selectedImage?.id === image.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <Image
                src={image.imageUrl}
                alt={image.altText || ''}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 