"use client";

import { SampleRequestForm } from "./sample-request-form";
import { createSampleRequest } from "@/lib/orders/actions";

export interface ClientSampleFormProps {
  productId: string;
  productName: string;
}

export function ClientSampleForm({ productId, productName }: ClientSampleFormProps) {
  return (
    <SampleRequestForm
      productId={productId}
      productName={productName}
      createSampleRequestAction={createSampleRequest}
    />
  );
} 