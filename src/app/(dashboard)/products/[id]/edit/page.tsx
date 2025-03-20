import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products/queries";
import EditProductForm from "@/components/products/edit-product-form";
import { requireAuth } from "@/lib/auth/session";

export const metadata = {
  title: "Edit Product",
  description: "Update your product details",
};

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth();
  const product = await getProductById(params.id);
  
  // Check if product exists and belongs to current user
  if (!product || product.craftmanId !== session.user.id) {
    notFound();
  }
  
  return (
    <div className="container py-10">
      <EditProductForm product={product} />
    </div>
  );
} 