import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-18">
        <a href="/" className="font-serif text-xl font-semibold text-primary">
          MainStreetIRL
        </a>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-primary hover:text-accent transition-colors">
            How It Works
          </a>
          <a href="#about" className="text-sm font-medium text-primary hover:text-accent transition-colors">
            About
          </a>
          <Button variant="accent" size="sm">
            Join the Waitlist
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="accent" size="sm" className="md:hidden">
          Join Waitlist
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
