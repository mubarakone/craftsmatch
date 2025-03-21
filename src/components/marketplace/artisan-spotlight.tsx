import { getFeaturedArtisans } from "@/lib/marketplace/queries";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

interface ArtisanSpotlightProps {
  limit?: number;
}

export async function ArtisanSpotlight({ limit = 4 }: ArtisanSpotlightProps) {
  const artisans = await getFeaturedArtisans(limit);

  if (!artisans || artisans.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Featured Artisans</h2>
        <p className="text-gray-500">No featured artisans available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Featured Artisans</h2>
        <Link 
          href="/artisans" 
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all artisans →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {artisans.map((artisan) => {
          // Get initials for avatar fallback
          const initials = artisan.user?.name 
            ? artisan.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : artisan.businessName.substring(0, 2).toUpperCase();
            
          return (
            <Card key={artisan.id} className="overflow-hidden">
              <div className="relative h-40 bg-gradient-to-r from-blue-100 to-indigo-100">
                {artisan.portfolioImages && artisan.portfolioImages.length > 0 ? (
                  <Image
                    src={artisan.portfolioImages[0]}
                    alt={artisan.businessName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-2xl font-semibold text-gray-400">{initials}</span>
                  </div>
                )}
              </div>
              
              <CardContent className="pt-6 pb-2 relative">
                <Avatar className="absolute -top-6 left-4 h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={artisan.user?.avatarUrl} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                
                <div className="ml-2">
                  <h3 className="font-bold">{artisan.businessName}</h3>
                  <p className="text-sm text-gray-500">{artisan.specialty}</p>
                </div>
                
                {artisan.products && artisan.products.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Featured work:</p>
                    <div className="flex space-x-2">
                      {artisan.products.slice(0, 3).map((product) => (
                        <div key={product.id} className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0].imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-xs text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end pt-2 pb-4">
                <Link 
                  href={`/artisans/${artisan.id}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  View profile →
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 