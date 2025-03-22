import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Craftsmen Directory | CraftsMatch",
  description: "Browse our directory of skilled craftsmen and artisans.",
};

// Mock craftsmen data to use when database fetch fails
const mockCraftsmen = [
  {
    id: "1",
    business_name: "Oak & Pine Woodworks",
    location: "Portland, Oregon",
    specialization: "Custom furniture, cabinetry, wooden decor",
    years_of_experience: 12,
    profile_image: null
  },
  {
    id: "2",
    business_name: "Ironforge Metalcraft",
    location: "Detroit, Michigan",
    specialization: "Ornamental ironwork, metal furniture, architectural elements",
    years_of_experience: 8,
    profile_image: null
  },
  {
    id: "3",
    business_name: "Stonehill Masonry",
    location: "Boulder, Colorado",
    specialization: "Stone walls, fireplaces, outdoor kitchens",
    years_of_experience: 15,
    profile_image: null
  },
  {
    id: "4",
    business_name: "Glass Haven Studio",
    location: "Seattle, Washington",
    specialization: "Stained glass, glass sculpture, custom windows",
    years_of_experience: 10,
    profile_image: null
  },
  {
    id: "5",
    business_name: "Textile Traditions",
    location: "Santa Fe, New Mexico",
    specialization: "Handwoven textiles, upholstery, custom drapery",
    years_of_experience: 20,
    profile_image: null
  },
  {
    id: "6",
    business_name: "Clay & Kiln Pottery",
    location: "Asheville, North Carolina",
    specialization: "Functional pottery, ceramic art, custom tile work",
    years_of_experience: 14,
    profile_image: null
  }
];

async function getCraftsmen() {
  const supabase = createClient();
  
  try {
    // Fetch from the database
    const { data, error } = await supabase
      .from("craftsman_profiles")
      .select("*")
      .order("business_name");
      
    if (error) {
      console.error("Error fetching craftsmen:", error);
      return mockCraftsmen; // Return mock data on error
    }
    
    if (data && data.length > 0) {
      return data; // Return real data if available
    } else {
      return mockCraftsmen; // Return mock data if no results
    }
  } catch (err) {
    console.error("Exception fetching craftsmen:", err);
    return mockCraftsmen; // Return mock data on exception
  }
}

export default async function CraftsmenPage() {
  const craftsmen = await getCraftsmen();
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Craftsmen Directory</h1>
      <p className="text-muted-foreground mb-8">Browse skilled artisans and craftsmen</p>
      
      {craftsmen.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No craftsmen profiles found.</p>
          <p className="text-sm mt-2">Check back soon as our community grows!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {craftsmen.map((craftsman) => (
            <Card key={craftsman.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="h-48 w-full bg-muted relative">
                  {craftsman.profile_image ? (
                    <Image
                      src={craftsman.profile_image}
                      alt={craftsman.business_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                      <span className="text-2xl font-bold text-secondary-foreground/40">
                        {craftsman.business_name?.charAt(0) || "C"}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold">{craftsman.business_name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{craftsman.location}</p>
                <p className="text-sm font-medium mt-4">Specialization</p>
                <p className="text-sm text-muted-foreground">{craftsman.specialization}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  {craftsman.years_of_experience} years experience
                </span>
                <Link 
                  href={`/craftsmen/${craftsman.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Profile
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 