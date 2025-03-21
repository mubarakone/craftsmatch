import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <div className="relative bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32 bg-gray-50">
          <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
                  <div className="lg:py-24">
                    <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-gray-900 sm:mt-5 sm:text-5xl lg:mt-6 xl:text-6xl">
                      <span className="block xl:inline">Discover Unique</span>{' '}
                      <span className="block text-blue-600 xl:inline">Handcrafted Products</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                      Connect directly with skilled artisans and craftsmen to find one-of-a-kind items
                      or commission custom pieces built to your specifications.
                    </p>
                    <div className="mt-8 sm:mt-12">
                      <div className="sm:flex sm:justify-center lg:justify-start">
                        <div className="rounded-md shadow">
                          <Link href="/marketplace">
                            <Button size="lg" className="w-full">
                              Browse Marketplace
                            </Button>
                          </Link>
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-3">
                          <Link href="#how-it-works">
                            <Button variant="outline" size="lg" className="w-full">
                              How it Works
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-12 -mb-16 sm:-mb-48 lg:m-0 lg:relative">
                  <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
                    <div className="w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-full">
                      <div className="h-56 w-full bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-xl sm:h-64 lg:h-full lg:w-auto lg:max-w-none">
                        <div className="relative h-full w-full">
                          <Image
                            src="/images/marketplace-hero.jpg"
                            alt="Craftsman working on wooden furniture"
                            fill
                            className="object-cover rounded-xl"
                            priority
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 