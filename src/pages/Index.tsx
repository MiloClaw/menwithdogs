import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueProposition from "@/components/ValueProposition";
import HowItWorks from "@/components/HowItWorks";
import WhoThisIsNotFor from "@/components/WhoThisIsNotFor";
import PrivacyTrust from "@/components/PrivacyTrust";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
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
  );
};

export default Index;
