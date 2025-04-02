import { getStorefrontBySlug, getStorefrontProducts } from "@/lib/storefront/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MapPin, Mail, Phone } from "lucide-react";

// Make this page dynamic to avoid static build issues
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const storefront = await getStorefrontBySlug(params.slug);
  
  if (!storefront) {
    return {
      title: "Storefront Not Found | CraftsMatch",
      description: "The storefront you are looking for could not be found.",
    };
  }
  
  return {
    title: `${storefront.name} | CraftsMatch`,
    description: storefront.description?.substring(0, 160) || `Shop at ${storefront.name}`,
  };
}

export default async function StorefrontPage({ params }: { params: { slug: string } }) {
  try {
    const storefront = await getStorefrontBySlug(params.slug);
    
    if (!storefront) {
      notFound();
    }
    
    const products = await getStorefrontProducts(storefront.id);
    
    const customization = storefront.customization || {
      primaryColor: "#4f46e5",
      secondaryColor: "#f43f5e",
      accentColor: "#10b981",
      fontFamily: "Inter",
      headerLayout: "standard",
      productCardStyle: "standard",
    };
    
    const customStyle = {
      "--primary-color": customization.primaryColor,
      "--secondary-color": customization.secondaryColor,
      "--accent-color": customization.accentColor,
      "--font-family": customization.fontFamily,
    } as React.CSSProperties;

    return (
      <div style={customStyle}>
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 bg-slate-200">
          {storefront.bannerUrl ? (
            <Image 
              src={storefront.bannerUrl} 
              alt={`${storefront.name} banner`}
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div 
              className="h-full flex items-center justify-center"
              style={{ backgroundColor: customization.primaryColor }}
            >
              <div className="text-center text-white p-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {storefront.name}
                </h1>
                <p className="max-w-2xl mx-auto text-white/80">
                  {storefront.description?.substring(0, 100) || ""}
                  {storefront.description && storefront.description.length > 100 ? '...' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div 
          className="sticky top-0 z-10 border-b shadow-sm"
          style={{ backgroundColor: "white" }}
        >
          <div className="container flex justify-between items-center h-16">
            <div className="font-bold text-lg" style={{ color: customization.primaryColor }}>
              {storefront.name}
            </div>
            <div className="flex gap-6">
              <Link 
                href={`/stores/${params.slug}`} 
                className="font-medium"
                style={{ color: customization.primaryColor }}
              >
                Home
              </Link>
              <Link 
                href={`/stores/${params.slug}/products`} 
                className="text-gray-600 hover:text-gray-900"
              >
                Products
              </Link>
              <Link 
                href={`/stores/${params.slug}/about`} 
                className="text-gray-600 hover:text-gray-900"
              >
                About
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container py-10">
          {/* Featured Products */}
          <div className="mb-16">
            <h2 
              className="text-2xl font-bold mb-6"
              style={{ color: customization.primaryColor }}
            >
              Featured Products
            </h2>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    <div 
                      className="border rounded-lg overflow-hidden transition-shadow hover:shadow-md"
                      style={{ borderColor: customization.secondaryColor }}
                    >
                      <div className="aspect-square bg-slate-100 relative">
                        {product.imageUrl ? (
                          <Image 
                            src={product.imageUrl} 
                            alt={product.name}
                            fill
                            style={{ objectFit: "cover" }}
                            className="transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-1">{product.name}</h3>
                        <p className="text-slate-600">{formatPrice(product.price)}</p>
                        <Button 
                          className="mt-3 w-full"
                          style={{ 
                            backgroundColor: customization.accentColor,
                            color: "white",
                            border: "none"
                          }}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          View Product
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg bg-slate-50">
                <p className="text-slate-600 mb-4">No products available yet.</p>
                <p className="text-slate-500">Check back soon for new additions!</p>
              </div>
            )}
            
            {products.length > 0 && (
              <div className="mt-8 text-center">
                <Button 
                  asChild
                  variant="outline"
                  className="font-medium"
                >
                  <Link href={`/stores/${params.slug}/products`}>
                    View All Products
                  </Link>
                </Button>
              </div>
            )}
          </div>
          
          {/* About the Craftsman */}
          <div className="bg-slate-50 rounded-lg p-6 md:p-8">
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: customization.primaryColor }}
            >
              About the Craftsman
            </h2>
            
            <div className="prose max-w-none">
              <p>{storefront.description}</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 
                className="font-medium mb-3"
                style={{ color: customization.secondaryColor }}
              >
                Contact Information
              </h3>
              
              <div className="space-y-2">
                {storefront.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                    <span>{storefront.location}</span>
                  </div>
                )}
                
                {storefront.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-slate-500" />
                    <a 
                      href={`mailto:${storefront.contactEmail}`}
                      className="hover:underline"
                      style={{ color: customization.primaryColor }}
                    >
                      {storefront.contactEmail}
                    </a>
                  </div>
                )}
                
                {storefront.contactPhone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-slate-500" />
                    <a 
                      href={`tel:${storefront.contactPhone}`}
                      className="hover:underline"
                      style={{ color: customization.primaryColor }}
                    >
                      {storefront.contactPhone}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Button
                  style={{ 
                    backgroundColor: customization.accentColor,
                    color: "white",
                    border: "none"
                  }}
                >
                  Contact Seller
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer 
          className="py-6 text-white mt-10"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="font-bold text-lg">{storefront.name}</div>
                <div className="text-sm text-white/70">© {new Date().getFullYear()} All rights reserved</div>
              </div>
              
              <div className="flex gap-6 text-sm">
                <Link 
                  href={`/stores/${params.slug}`}
                  className="text-white/80 hover:text-white"
                >
                  Home
                </Link>
                <Link 
                  href={`/stores/${params.slug}/products`}
                  className="text-white/80 hover:text-white"
                >
                  Products
                </Link>
                <Link 
                  href={`/stores/${params.slug}/about`}
                  className="text-white/80 hover:text-white"
                >
                  About
                </Link>
                <Link 
                  href="/terms"
                  className="text-white/80 hover:text-white"
                >
                  Terms
                </Link>
                <Link 
                  href="/privacy"
                  className="text-white/80 hover:text-white"
                >
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("Error loading storefront page:", error);
    notFound();
  }
} 