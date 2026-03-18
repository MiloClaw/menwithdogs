import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-sunset-forest.jpg";
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
  const scrollToValueProp = () => {
    document.querySelector('section[class*="py-28"]')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const parallaxTransform = prefersReducedMotion ? 'none' : `translateY(${scrollY * 0.15}px)`;
  const indicatorOpacity = scrollY > 50 ? 0 : 1;
  return <section className="relative pt-16 md:pt-18">
      {/* Hero Image */}
      <div className="relative h-[480px] md:h-[560px] overflow-hidden">
        <img src={heroImage} alt="Man and dog at golden hour in a sun-dappled forest park" fetchPriority="high" width={1920} height={672} className="w-full h-[120%] object-cover object-top will-change-transform" style={{
        transform: parallaxTransform,
        clipPath: 'inset(0 0 16px 0)'
      }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/80" />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-12 md:pb-16 px-[20px]">
          <h1 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)] ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
            Real places.<br />
            Shared interests.<br />
            Real-world connection.
          </h1>
          
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8 bg-background">
        <BrandStripe size="md" className="mb-8" />
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-6 px-4 text-pretty">
          The dog-friendly places directory for gay men. Find parks, bars, trails, and spots where you and your dog are always welcome.
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
        
        {/* Scroll Indicator */}
        <div 
          className="mt-8 flex flex-col items-center gap-2 cursor-pointer"
          onClick={scrollToValueProp}
          style={{ opacity: indicatorOpacity, transition: 'opacity 0.3s' }}
        >
          <span className="text-xs text-muted-foreground/70 tracking-wide uppercase">
            Scroll to explore
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground/50 ${
              !prefersReducedMotion ? 'animate-bounce-gentle' : ''
            }`} 
          />
        </div>
      </div>

      {/* Tagline */}
      
    </section>;
};
export default Hero;