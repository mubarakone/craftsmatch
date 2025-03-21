import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { FeaturedProducts } from "@/components/marketplace/featured-products";
import { ArtisanSpotlight } from "@/components/marketplace/artisan-spotlight";
import { HeroSection } from "@/components/marketplace/hero-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      
      <div className="container py-16 space-y-16">
        <Suspense fallback={<div>Loading products...</div>}>
          <FeaturedProducts />
        </Suspense>
        
        <Suspense fallback={<div>Loading artisans...</div>}>
          <ArtisanSpotlight />
        </Suspense>
        
        <section id="how-it-works" className="py-10">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Browse & Discover</h3>
              <p className="text-gray-600">
                Explore unique handcrafted products or find skilled craftsmen for custom work
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Connect & Customize</h3>
              <p className="text-gray-600">
                Message artisans directly to discuss details, request samples, or customize orders
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Purchase & Review</h3>
              <p className="text-gray-600">
                Complete your purchase securely and leave feedback after receiving your item
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
