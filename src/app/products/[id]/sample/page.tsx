import { notFound, redirect } from "next/navigation";
import { ClientSampleForm } from "@/components/orders/client-sample-form";
import { getSession } from "@/lib/auth/session";

// Make this page dynamic to avoid static build issues
export const dynamic = 'force-dynamic';

// Use a client component wrapper since we're using a form with client-side validation
export interface SampleRequestPageProps {
  params: {
    id: string;
  };
}

export default async function SampleRequestPage({ params }: SampleRequestPageProps) {
  try {
    // Get session and redirect if not logged in 
    const session = await getSession();
    if (!session || !session.user) {
      redirect(`/sign-in?redirect=/products/${params.id}/sample`);
    }
    
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
            userEmail={session.user.email || ""}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading sample request page:", error);
    notFound();
  }
} 