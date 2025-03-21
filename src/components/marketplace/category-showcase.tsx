import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  products?: {
    images?: {
      imageUrl: string;
    }[];
  }[];
}

interface CategoryShowcaseProps {
  categories: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Categories</h2>
        <p className="text-gray-500">No categories available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Browse by Category</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => {
          const firstProductImage = category.products?.[0]?.images?.[0]?.imageUrl;
          
          return (
            <Link 
              key={category.id} 
              href={`/marketplace?category=${category.slug}`}
              className="transition-transform hover:scale-105"
            >
              <Card className="overflow-hidden h-full border-0 shadow-sm">
                <div className="relative h-32 w-full bg-gray-100">
                  {firstProductImage ? (
                    <Image
                      src={firstProductImage}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-50 to-indigo-50">
                      <span className="text-lg font-medium text-gray-400">{category.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 