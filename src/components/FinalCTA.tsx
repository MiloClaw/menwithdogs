import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-24 md:py-32 bg-gradient-to-b from-background to-surface/50 border-t border-border">
      <div className="container">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-12 h-px bg-border mx-auto mb-8" />
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-8 tracking-tight text-balance">
            Your next favorite spot — and the couples who'll share it with you.
          </h2>
          
          <Button variant="accent" size="lg" className="tracking-wide uppercase" onClick={() => navigate('/auth?mode=signup')}>
            Get Early Access
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
