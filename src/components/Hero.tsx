import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-couples.jpg";
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
        <img src={heroImage} alt="People enjoying a local café together" className="w-full h-[120%] object-cover object-top will-change-transform" style={{
        transform: parallaxTransform
      }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background/85" />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-12 md:pb-16">
          <h1 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-4 [text-shadow:_0_1px_2px_rgba(0,0,0,0.5),_0_4px_8px_rgba(0,0,0,0.3),_0_8px_16px_rgba(0,0,0,0.2)] ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
            Real Community.<br />
            Real Places.<br />
            Real Life — Again.
          </h1>
          
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8 bg-background border-t border-border">
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-6">
          <Button variant="accent" size="lg" onClick={() => navigate('/auth?mode=signup')}>
            Join the Community
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/places')}>
            <MapPin className="w-4 h-4 mr-2" />
            Explore Places
          </Button>
        </div>
      </div>

      {/* Tagline */}
      <div className="text-center py-10 bg-background border-t border-border">
        <p className="font-serif text-lg md:text-xl text-foreground font-medium">
          This is not a dating app.
        </p>
        <p className="text-base text-muted-foreground mt-2">
          It's a community layer for real life.
        </p>
        <button onClick={scrollToHowItWorks} className="mt-4 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
          See how it works
        </button>
      </div>
    </section>;
};
export default Hero;