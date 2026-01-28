import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-hiking-men.jpg";
import BrandStripe from "@/components/BrandStripe";

const Hero = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);
    const handleScroll = () => {
      if (window.scrollY < 700) {
        requestAnimationFrame(() => setScrollY(window.scrollY));
      }
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
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
  return <section className="relative pt-16 md:pt-18">
      {/* Hero Image */}
      <div className="relative h-[480px] md:h-[560px] overflow-hidden">
        <img src={heroImage} alt="People enjoying a local café together" fetchPriority="high" width={1920} height={672} className="w-full h-[120%] object-cover object-top will-change-transform" style={{
        transform: parallaxTransform,
        clipPath: 'inset(0 0 16px 0)'
      }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/80" />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-12 md:pb-16 px-[20px]">
          <h1 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)] ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
            Real places. Shared interests.<br />
            Real-world connection.
          </h1>
          
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8 bg-background">
        <BrandStripe size="md" className="mb-8" />
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-6 px-4 text-pretty">
          A place-based directory that helps men connect more organically through outdoor activities, shared hobbies, and the places their community already gathers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-6">
          <Button variant="accent" size="lg" onClick={() => navigate('/auth?mode=signup')}>
            Join Free
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/places')}>
            <MapPin className="w-4 h-4 mr-2" />
            Explore Places
          </Button>
        </div>
      </div>

      {/* Tagline */}
      
    </section>;
};
export default Hero;