import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          CraftsMatch
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Connecting artisanal craftsmen with builders and designers. 
          A marketplace for unique and quality building materials.
        </p>
        <div className="space-x-4">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">Learn More</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          
          <Card>
            <CardHeader>
              <CardTitle>For Craftsmen</CardTitle>
              <CardDescription>Showcase your artisanal craftsmanship</CardDescription>
            </CardHeader>
            <CardContent>
              <p>List your unique products and connect with builders and designers looking for quality materials.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-black text-white hover:bg-gray-800">Join as Craftsman</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Our marketplace platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A secure platform connecting craftsmen and builders, with sample requests, custom orders, and more.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Learn More</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Builders</CardTitle>
              <CardDescription>Find unique building materials</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Discover high-quality artisanal materials for your construction and design projects.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-black text-white hover:bg-gray-800">Join as Builder</Button>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}
