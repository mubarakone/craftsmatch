export const metadata = {
  title: "About | CraftsMatch",
  description: "Learn more about CraftsMatch - Connecting craftsmen and builders.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">About CraftsMatch</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="lead">
            CraftsMatch is a platform dedicated to connecting skilled craftsmen with 
            builders and customers who appreciate quality craftsmanship.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            Our mission is to create a thriving marketplace where traditional craftsmanship 
            meets modern needs. We believe in supporting skilled artisans and providing 
            builders with access to high-quality, custom-made products.
          </p>
          
          <h2>How It Works</h2>
          <p>
            CraftsMatch provides a simple way for craftsmen to showcase their work and 
            for builders to find the perfect craftsman for their projects:
          </p>
          
          <ul>
            <li>Craftsmen create profiles highlighting their skills and products</li>
            <li>Builders browse and connect with craftsmen directly</li>
            <li>Secure messaging and transaction handling</li>
            <li>Review system ensures quality and accountability</li>
          </ul>
          
          <h2>Join Our Community</h2>
          <p>
            Whether you're a skilled craftsman looking to showcase your work or a builder 
            seeking quality craftsmanship, CraftsMatch offers the platform you need to connect 
            and collaborate.
          </p>
        </div>
      </div>
    </div>
  );
} 