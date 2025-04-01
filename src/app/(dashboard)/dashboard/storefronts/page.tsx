import { auth } from "@/lib/auth/utils";
import { getUserStorefronts } from "@/lib/storefront/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Plus, Store, PenSquare, ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Manage Storefronts | CraftsMatch",
  description: "Manage your craft storefronts",
};

export default async function ManageStorefrontsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const storefronts = await getUserStorefronts(session.user.id);

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Storefronts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your online stores and customize their appearance
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href="/storefront/setup">
              <Plus className="mr-2 h-4 w-4" />
              Create New Storefront
            </Link>
          </Button>
        </div>
      </div>

      {storefronts.length === 0 ? (
        <div className="bg-muted/40 border border-dashed rounded-lg flex flex-col items-center justify-center py-16 px-4 text-center">
          <Store className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="font-medium text-lg mb-1">No storefronts yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first storefront to showcase your craft products online. Customize it with your brand colors and style.
          </p>
          <Button asChild>
            <Link href="/storefront/setup">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Storefront
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storefronts.map((storefront) => (
            <Card key={storefront.id}>
              <CardHeader>
                <div className="h-36 -mt-6 -mx-6 mb-2 bg-slate-100 relative">
                  {storefront.bannerUrl ? (
                    <Image
                      src={storefront.bannerUrl}
                      alt={`${storefront.name} banner`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                      <Store className="h-10 w-10 text-indigo-500" />
                    </div>
                  )}
                  
                  {storefront.logoUrl && (
                    <div className="absolute bottom-0 translate-y-1/2 left-6 h-12 w-12 rounded-full overflow-hidden border-2 border-white bg-white">
                      <Image
                        src={storefront.logoUrl}
                        alt={`${storefront.name} logo`}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
                
                <CardTitle className="mt-4">{storefront.name}</CardTitle>
                <CardDescription>
                  Created on {formatDate(storefront.createdAt)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {storefront.description.length > 100
                    ? `${storefront.description.substring(0, 100)}...`
                    : storefront.description}
                </p>
                
                <div className="mt-4 text-xs border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="font-mono text-xs">/stores/{storefront.slug}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/storefront/customize?id=${storefront.id}`}>
                      <PenSquare className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/stores/${storefront.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 