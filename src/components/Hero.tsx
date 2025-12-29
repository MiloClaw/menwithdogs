import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-couples.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleMotionChange);
    
    // Scroll handler with RAF for smooth 60fps
    const handleScroll = () => {
      if (window.scrollY < 700) {
        requestAnimationFrame(() => setScrollY(window.scrollY));
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);
  
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  
  const parallaxTransform = prefersReducedMotion ? 'none' : `translateY(${scrollY * 0.15}px)`;
  
  return (
    <section className="relative pt-16 md:pt-18">
      {/* Hero Image */}
      <div className="relative h-[480px] md:h-[560px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Two couples enjoying coffee and conversation together outdoors" 
          className="w-full h-[120%] object-cover object-top will-change-transform"
          style={{ transform: parallaxTransform }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/70" />
        
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-primary leading-tight mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            Real friends.<br />
            Real couples.<br />
            Real life.
          </h1>
          
          <p className="text-foreground/80 text-base md:text-lg max-w-md mb-8 font-medium">
            For couples to meet other couples— dinners, workouts, travel, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button variant="accent" size="lg" onClick={() => navigate('/auth?mode=signup')}>
              Join the Waitlist
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-background/80 backdrop-blur-sm border-2" 
              onClick={scrollToHowItWorks}
            >
              See How It Works
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tagline */}
      <div className="text-center py-10 bg-background border-t border-border">
        <p className="font-serif text-lg md:text-xl text-muted-foreground italic font-medium">
          No swiping. No pressure. No performance.
        </p>
      </div>
    </section>
  );
};

export default Hero;
