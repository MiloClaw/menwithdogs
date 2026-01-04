import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueProposition from "@/components/ValueProposition";
import WhoThisIsNotFor from "@/components/WhoThisIsNotFor";
import HowItWorks from "@/components/HowItWorks";
import PrivacyTrust from "@/components/PrivacyTrust";
import WhyThisExists from "@/components/WhyThisExists";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ValueProposition />
      <WhoThisIsNotFor />
      <HowItWorks />
      <PrivacyTrust />
      <WhyThisExists />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
