import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-24 md:py-32 bg-gradient-to-b from-background to-surface/50 border-t border-border">
      <div className="container">
        <div className="text-center max-w-xl mx-auto">
          <div className="w-16 h-px bg-border mx-auto mb-8" />
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-8">
            Step out of the group chat.<br />
            Step into real connection.
          </h2>
          
          <Button variant="accent" size="lg" onClick={() => navigate('/auth?mode=signup')}>
            Join the Waitlist
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
