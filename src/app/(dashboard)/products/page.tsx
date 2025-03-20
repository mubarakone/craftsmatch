import { Suspense } from "react";
import { getCraftsmanProducts } from "@/lib/products/queries";
import ProductList from "@/components/products/product-list";
import { requireAuth } from "@/lib/auth/session";

export const metadata = {
  title: "Product Management",
  description: "Manage your craftsman products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const session = await requireAuth();
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const { products, total } = await getCraftsmanProducts({
    userId: session.user.id,
    limit,
    offset,
    categoryId: searchParams?.category,
  });

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage your product listings
        </p>
      </div>
      
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductList products={products} totalCount={total} />
      </Suspense>
    </div>
  );
} 