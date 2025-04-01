"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { publishStorefront } from "@/lib/storefront/actions";
import { StorefrontWithCustomization } from "@/lib/storefront/types";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Laptop,
  Smartphone,
  Tablet,
  Check,
  ExternalLink,
  Settings,
  ShoppingBag,
  Info,
} from "lucide-react";

interface StorefrontPreviewProps {
  storefront: StorefrontWithCustomization;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  }>;
}

export function StorefrontPreview({ storefront, products = [] }: StorefrontPreviewProps) {
  const [activeDevice, setActiveDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "success" | "error">("idle");
  const router = useRouter();

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

  const getDeviceWidth = () => {
    switch (activeDevice) {
      case "desktop": return "w-full";
      case "tablet": return "w-[768px]";
      case "mobile": return "w-[375px]";
    }
  };

  async function handlePublish() {
    setIsPublishing(true);
    try {
      await publishStorefront(storefront.id);
      setPublishStatus("success");
      // Wait for a while to show the success state
      setTimeout(() => {
        router.push(`/storefront/dashboard?id=${storefront.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error publishing storefront:", error);
      setPublishStatus("error");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Preview Your Storefront</h1>
          <p className="text-muted-foreground mt-2">
            Review how your storefront will look to customers before publishing.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/storefront/customize?id=${storefront.id}`)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit Appearance
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={isPublishing || publishStatus === "success"}
          >
            {publishStatus === "success" ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Published!
              </>
            ) : isPublishing ? (
              "Publishing..."
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Publish Storefront
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-slate-100 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-medium">Preview Mode</h2>
            <p className="text-sm text-muted-foreground">Select a device to preview your storefront</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={activeDevice === "desktop" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveDevice("desktop")}
            >
              <Laptop className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Desktop</span>
            </Button>
            <Button 
              variant={activeDevice === "tablet" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveDevice("tablet")}
            >
              <Tablet className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Tablet</span>
            </Button>
            <Button 
              variant={activeDevice === "mobile" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveDevice("mobile")}
            >
              <Smartphone className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Mobile</span>
            </Button>
          </div>
        </div>

        <div className="flex justify-center border-t pt-6">
          <div className={`border bg-white rounded-lg shadow-lg ${getDeviceWidth()} transition-all duration-300`}>
            {/* Storefront Preview */}
            <div className="overflow-hidden" style={customStyle}>
              {/* Header */}
              <div 
                className="p-4 flex justify-between items-center border-b"
                style={{ backgroundColor: customization.primaryColor }}
              >
                <div className="text-white font-bold text-xl">
                  {storefront.name}
                </div>
                <div className="flex gap-4">
                  <div className="text-white text-sm">Home</div>
                  <div className="text-white text-sm">Products</div>
                  <div className="text-white text-sm">About</div>
                  <div className="text-white text-sm">Contact</div>
                </div>
              </div>

              {/* Hero Banner */}
              <div className="relative h-64 bg-slate-200 flex items-center justify-center">
                {storefront.bannerUrl ? (
                  <Image 
                    src={storefront.bannerUrl} 
                    alt={`${storefront.name} banner`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="text-center p-6">
                    <h2 
                      className="text-3xl font-bold mb-2"
                      style={{ color: customization.primaryColor }}
                    >
                      Welcome to {storefront.name}
                    </h2>
                    <p className="text-slate-600 max-w-md mx-auto">
                      {storefront.description.substring(0, 100)}
                      {storefront.description.length > 100 ? '...' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Products Section */}
              <div className="p-6">
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: customization.primaryColor }}
                >
                  Featured Products
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <div 
                        key={product.id} 
                        className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                        style={{ borderColor: customization.secondaryColor }}
                      >
                        <div className="h-48 bg-slate-200 relative">
                          {product.imageUrl && (
                            <Image 
                              src={product.imageUrl} 
                              alt={product.name}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-slate-600">${product.price.toFixed(2)}</p>
                          <button 
                            className="mt-2 text-white px-4 py-2 rounded-md w-full text-sm"
                            style={{ backgroundColor: customization.accentColor }}
                          >
                            View Product
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="border rounded-md overflow-hidden"
                        style={{ borderColor: customization.secondaryColor }}
                      >
                        <div className="h-48 bg-slate-200"></div>
                        <div className="p-4">
                          <h4 className="font-medium">Product Example</h4>
                          <p className="text-slate-600">$99.99</p>
                          <button 
                            className="mt-2 text-white px-4 py-2 rounded-md w-full text-sm"
                            style={{ backgroundColor: customization.accentColor }}
                          >
                            View Product
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* About Section */}
              <div className="p-6 bg-slate-50">
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: customization.primaryColor }}
                >
                  About {storefront.name}
                </h3>
                <p className="mb-4 text-slate-600">
                  {storefront.description}
                </p>
                <div className="mt-4">
                  <h4 
                    className="font-medium mb-2"
                    style={{ color: customization.secondaryColor }}
                  >
                    Contact Information
                  </h4>
                  <p className="text-sm text-slate-600">
                    {storefront.location && (
                      <div className="mb-1">
                        <span className="font-medium">Location:</span> {storefront.location}
                      </div>
                    )}
                    {storefront.contactEmail && (
                      <div className="mb-1">
                        <span className="font-medium">Email:</span> {storefront.contactEmail}
                      </div>
                    )}
                    {storefront.contactPhone && (
                      <div className="mb-1">
                        <span className="font-medium">Phone:</span> {storefront.contactPhone}
                      </div>
                    )}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div 
                className="p-4 text-white text-sm"
                style={{ backgroundColor: customization.primaryColor }}
              >
                <div className="flex justify-between items-center">
                  <div>© {new Date().getFullYear()} {storefront.name}</div>
                  <div className="flex gap-4">
                    <div>Terms</div>
                    <div>Privacy</div>
                    <div>Contact</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Badge variant="outline" className="mt-0.5 mr-2">1</Badge>
                <span>Publish your storefront</span>
              </li>
              <li className="flex items-start">
                <Badge variant="outline" className="mt-0.5 mr-2">2</Badge>
                <span>Add products to your store</span>
              </li>
              <li className="flex items-start">
                <Badge variant="outline" className="mt-0.5 mr-2">3</Badge>
                <span>Share your store link with customers</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handlePublish}>
              <Check className="mr-2 h-4 w-4" />
              Publish Storefront
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Storefront Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd>{storefront.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">URL</dt>
                <dd className="flex items-center">
                  craftsmatch.com/stores/{storefront.slug}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This will be your public store URL once published</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="outline">Draft</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Appearance Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-muted-foreground">Theme Colors</dt>
                <dd className="flex gap-2">
                  <div 
                    className="h-6 w-6 rounded-full border" 
                    style={{ backgroundColor: customization.primaryColor }}
                    title="Primary Color"
                  ></div>
                  <div 
                    className="h-6 w-6 rounded-full border" 
                    style={{ backgroundColor: customization.secondaryColor }}
                    title="Secondary Color"
                  ></div>
                  <div 
                    className="h-6 w-6 rounded-full border" 
                    style={{ backgroundColor: customization.accentColor }}
                    title="Accent Color"
                  ></div>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Font Family</dt>
                <dd>{customization.fontFamily}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Header Layout</dt>
                <dd className="capitalize">{customization.headerLayout}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Product Card Style</dt>
                <dd className="capitalize">{customization.productCardStyle}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push(`/storefront/customize?id=${storefront.id}`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Edit Appearance
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 