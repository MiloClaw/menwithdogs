import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-14 md:h-16">
        <a href="/" className="font-serif text-lg md:text-xl font-semibold text-primary">
          MainStreetIRL
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <a href="/places" className="text-sm font-medium text-primary hover:text-accent transition-colors">
            Places
          </a>
          <a href="/blog" className="text-sm font-medium text-primary hover:text-accent transition-colors">
            Blog
          </a>
          <a href="/#how-it-works" className="text-sm font-medium text-primary hover:text-accent transition-colors">
            How It Works
          </a>
          <a href="/auth" className="text-sm font-medium text-primary hover:text-accent transition-colors">
            Sign In
          </a>
          <Button variant="accent" size="sm" onClick={() => navigate('/auth?mode=signup')}>
            Join the Waitlist
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -mr-2 text-primary"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-3">
            <a 
              href="/places" 
              className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Places
            </a>
            <a 
              href="/blog" 
              className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </a>
            <a 
              href="/#how-it-works" 
              className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="/auth" 
              className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </a>
            <Button 
              variant="accent" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/auth?mode=signup');
              }}
            >
              Join the Waitlist
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
