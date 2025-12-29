import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-couples.jpg";
const Hero = () => {
  const navigate = useNavigate();
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="relative pt-16 md:pt-18">
      {/* Hero Image */}
      <div className="relative h-[480px] md:h-[560px] overflow-hidden">
        <img src={heroImage} alt="Two couples enjoying coffee and conversation together outdoors" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/80" />
        
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-primary leading-tight mb-6">
            Real friends.<br />
            Real couples.<br />
            Real life.
          </h1>
          
          <p className="text-foreground/80 text-base md:text-lg max-w-md mb-8 font-medium">For couples to meet other couples— dinners, workouts, travel, and more.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button variant="accent" size="lg" onClick={() => navigate('/auth?mode=signup')}>
              Join the Waitlist
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="bg-background/80 backdrop-blur-sm" onClick={scrollToHowItWorks}>
              See How It Works
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tagline */}
      <div className="text-center py-8 bg-background">
        <p className="font-serif text-lg md:text-xl text-muted-foreground italic">
          No swiping. No pressure. No performance.
        </p>
      </div>
    </section>;
};
export default Hero;