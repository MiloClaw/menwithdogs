import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const scrollToHowItWorks = () => {
  const element = document.getElementById('how-it-works');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 md:py-40 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Ghost arrow */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] md:text-[20rem] font-serif font-bold text-primary-foreground/[0.03] leading-none select-none pointer-events-none">
        →
      </span>

      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center">
          {/* Mono label */}
          <span className="text-xs font-medium text-primary-foreground/40 tracking-[0.2em] uppercase mb-8 block">
            Ready?
          </span>

          {/* Large inviting headline */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-10 md:mb-12 text-balance">
            Ready to find your places?
          </h2>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="accent"
              size="lg"
              className="w-full sm:w-auto text-base px-8"
              onClick={() => navigate('/places')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Start Exploring
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={scrollToHowItWorks}
            >
              See How It Works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
