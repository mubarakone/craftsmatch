import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

// Mock craftsmen profiles for detail pages (used as fallback)
const mockCraftsmenProfiles = {
  "1": {
    id: "1",
    business_name: "Oak & Pine Woodworks",
    location: "Portland, Oregon",
    specialization: "Custom furniture, cabinetry, wooden decor",
    years_of_experience: 12,
    description: "With over a decade of experience in fine woodworking, Oak & Pine specializes in handcrafted furniture that combines traditional joinery with modern design. Every piece is made to order with careful attention to detail and client preferences.",
    profile_image: null,
    website: "https://www.oakandpinewoodworks.com",
    phone_number: "(503) 555-1234"
  },
  "2": {
    id: "2",
    business_name: "Ironforge Metalcraft",
    location: "Detroit, Michigan",
    specialization: "Ornamental ironwork, metal furniture, architectural elements",
    years_of_experience: 8,
    description: "Founded in Detroit's industrial district, Ironforge Metalcraft creates bold, functional pieces that celebrate the city's manufacturing heritage. From custom railings to statement furniture, each creation is built to last generations.",
    profile_image: null,
    website: "https://www.ironforgemetalcraft.com",
    phone_number: "(313) 555-6789"
  },
  "3": {
    id: "3",
    business_name: "Stonehill Masonry",
    location: "Boulder, Colorado",
    specialization: "Stone walls, fireplaces, outdoor kitchens",
    years_of_experience: 15,
    description: "Specializing in natural stone construction, Stonehill Masonry has been transforming Colorado homes and landscapes for 15 years. We work with local and imported stone to create structures that complement their natural surroundings.",
    profile_image: null,
    website: "https://www.stonehillmasonry.com",
    phone_number: "(720) 555-4321"
  },
  "4": {
    id: "4",
    business_name: "Glass Haven Studio",
    location: "Seattle, Washington",
    specialization: "Stained glass, glass sculpture, custom windows",
    years_of_experience: 10,
    description: "Glass Haven Studio creates custom stained glass pieces that transform ordinary spaces with light and color. From traditional to contemporary designs, our work can be found in homes, businesses, and public spaces throughout the Pacific Northwest.",
    profile_image: null,
    website: "https://www.glasshavenstudio.com",
    phone_number: "(206) 555-8765"
  },
  "5": {
    id: "5",
    business_name: "Textile Traditions",
    location: "Santa Fe, New Mexico",
    specialization: "Handwoven textiles, upholstery, custom drapery",
    years_of_experience: 20,
    description: "Textile Traditions blends Southwest patterns with global influences to create unique fabric designs. Our workshop uses both traditional looms and modern techniques to produce textiles for interior designers and discerning homeowners.",
    profile_image: null,
    website: "https://www.textiletraditions.com",
    phone_number: "(505) 555-9876"
  },
  "6": {
    id: "6",
    business_name: "Clay & Kiln Pottery",
    location: "Asheville, North Carolina",
    specialization: "Functional pottery, ceramic art, custom tile work",
    years_of_experience: 14,
    description: "Inspired by the rich pottery tradition of North Carolina, Clay & Kiln creates both functional vessels and decorative ceramic art. Each piece is wheel-thrown or hand-built in our Asheville studio using locally-sourced clay and glazes.",
    profile_image: null,
    website: "https://www.clayandkiln.com",
    phone_number: "(828) 555-2468"
  }
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const craftsman = await getCraftsmanProfile(params.id);
  
  if (!craftsman) {
    return {
      title: "Craftsman Not Found | CraftsMatch",
      description: "This craftsman profile could not be found.",
    };
  }
  
  return {
    title: `${craftsman.business_name} | CraftsMatch`,
    description: `View ${craftsman.business_name}'s profile and portfolio on CraftsMatch.`,
  };
}

async function getCraftsmanProfile(id: string) {
  const supabase = createClient();
  
  try {
    // Fetch from the database
    const { data, error } = await supabase
      .from("craftsman_profiles")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      console.error("Error fetching craftsman profile:", error);
      // Fall back to mock data if there's an error
      return mockCraftsmenProfiles[id] || null;
    }
    
    return data;
  } catch (err) {
    console.error("Exception fetching craftsman profile:", err);
    // Fall back to mock data if there's an exception
    return mockCraftsmenProfiles[id] || null;
  }
}

export default async function CraftsmanProfilePage({ params }: { params: { id: string } }) {
  const craftsman = await getCraftsmanProfile(params.id);
  const session = await getSession();
  
  if (!craftsman) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{craftsman.business_name}</h1>
          <p className="text-muted-foreground mb-6">{craftsman.location}</p>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <div className="prose max-w-none">
                <p>{craftsman.description || "No description provided."}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Specialization</h2>
              <p>{craftsman.specialization || "Not specified"}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Experience</h2>
              <p>{craftsman.years_of_experience} years of experience</p>
            </div>
          </div>
        </div>
        
        <div>
          <Card className="p-6">
            <div className="h-64 w-full bg-muted relative mb-6 rounded-md overflow-hidden">
              {craftsman.profile_image ? (
                <Image
                  src={craftsman.profile_image}
                  alt={craftsman.business_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                  <span className="text-4xl font-bold text-secondary-foreground/40">
                    {craftsman.business_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {craftsman.website && (
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <a 
                    href={craftsman.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {craftsman.website}
                  </a>
                </div>
              )}
              
              {craftsman.phone_number && (
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm">{craftsman.phone_number}</p>
                </div>
              )}
              
              <div className="pt-4">
                {session ? (
                  <Button className="w-full">Contact</Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/sign-in?redirect=/craftsmen/${params.id}`}>
                      Sign in to Contact
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 