import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container">
        <div className="text-center max-w-md mx-auto">
          <div className="w-12 h-px bg-border mx-auto mb-10" />

          <Button
            variant="accent"
            size="lg"
            className="tracking-wide"
            onClick={() => navigate('/places')}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Explore places in your city
          </Button>

          <p className="text-muted-foreground text-sm mt-6">
            Free to use. Upgrade only if you want deeper personalization.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
