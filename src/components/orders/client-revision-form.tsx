"use client";

import { RevisionRequestForm } from "./revision-request-form";

export interface ClientRevisionFormProps {
  orderId: string;
}

export function ClientRevisionForm({ orderId }: ClientRevisionFormProps) {
  return <RevisionRequestForm orderId={orderId} />;
} 