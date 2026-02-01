import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueProposition from "@/components/ValueProposition";
import HowItWorks from "@/components/HowItWorks";
import WhoThisIsNotFor from "@/components/WhoThisIsNotFor";
import PrivacyTrust from "@/components/PrivacyTrust";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { SITE_CONFIG } from "@/lib/site-config";

const homepageSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": SITE_CONFIG.siteName,
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web",
  "description": "A place-based outdoor directory for gay men. Discover trails, campsites, beaches, and active spaces shaped by shared interests.",
  "url": SITE_CONFIG.canonicalDomain,
  "logo": `${SITE_CONFIG.canonicalDomain}/favicon.png`,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

const Index = () => {
  return (
    <>
      <SEOHead
        title="Outdoor Places Directory for Gay Men"
        description="A place-based directory highlighting outdoor spaces, active lifestyles, and shared interests. Discover trails, campsites, and community gathering spots."
        keywords="outdoor directory, gay hiking, gay camping, LGBTQ outdoors, gay men trails, active lifestyle, outdoor community, place-based discovery"
        canonicalPath="/"
        schema={homepageSchema}
      />
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <ValueProposition />
        <HowItWorks />
        <WhoThisIsNotFor />
        <PrivacyTrust />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
};

export default Index;
