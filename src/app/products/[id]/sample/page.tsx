import { notFound } from "next/navigation";
import { ClientSampleForm } from "@/components/orders/client-sample-form";

// Use a client component wrapper since we're using a form with client-side validation
export interface SampleRequestPageProps {
  params: {
    id: string;
  };
}

export default function SampleRequestPage({ params }: SampleRequestPageProps) {
  // In a real app, you would fetch the product from the database
  // For now, we'll use placeholder data
  const product = {
    id: params.id,
    name: "Handcrafted Wooden Bowl",
    price: 129.99,
    description: "A beautiful handcrafted wooden bowl made from sustainable materials.",
    images: ["/images/product-1.jpg"]
  };

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Request a Sample</h1>
        <p className="text-muted-foreground mb-8">
          Samples allow you to verify the quality, material, and craftsmanship before
          committing to a full order. The artisan may charge a nominal fee for
          samples, which is typically refunded if you proceed with a full order.
        </p>
        
        <div className="bg-muted p-4 rounded-md mb-6">
          <h3 className="font-medium">Product: {product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You are requesting a sample of this product. Please provide the details below.
          </p>
        </div>
        
        <ClientSampleForm 
          productId={product.id}
          productName={product.name}
        />
      </div>
    </div>
  );
} 