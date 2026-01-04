import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-24 md:py-32 bg-gradient-to-b from-background to-surface/50 border-t border-border">
      <div className="container">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-12 h-px bg-border mx-auto mb-8" />
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2 tracking-tight text-balance">
            Reconnect with your city.
          </h2>
          <p className="font-serif text-xl md:text-2xl text-foreground/80 mb-6">
            Rebuild real community. On your terms.
          </p>

          <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
            Join quietly. Explore intentionally.<br />
            Say hello when it feels right.
          </p>

          <Button
            variant="accent"
            size="lg"
            className="tracking-wide"
            onClick={() => navigate('/auth?mode=signup')}
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
