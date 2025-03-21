import { redirect } from "next/navigation";

export default function SellerProductRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/products/manage/${params.id}`);
} 