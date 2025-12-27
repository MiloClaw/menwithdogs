import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueProposition from "@/components/ValueProposition";
import HowItWorks from "@/components/HowItWorks";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ValueProposition />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
