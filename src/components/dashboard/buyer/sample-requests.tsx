"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SampleRequest } from "@/lib/dashboard/buyer-queries";
import { Badge } from "@/components/ui/badge";

interface SampleRequestsCardProps {
  data: SampleRequest[];
  className?: string;
}

export function SampleRequestsCard({ data, className }: SampleRequestsCardProps) {
  const getStatusBadge = (status: SampleRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sample Requests</CardTitle>
        <CardDescription>Your recent sample requests</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((request) => (
              <div key={request.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium">{request.productName}</h4>
                  {getStatusBadge(request.status)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>Seller: {request.sellerName}</div>
                  <div>Requested: {request.requestDate}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">You haven't requested any samples yet.</p>
            <p className="text-xs mt-1 text-muted-foreground">
              Request samples to try before you make a purchase.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 