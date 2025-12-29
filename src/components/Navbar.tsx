import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X, LogOut, Shield } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, signOut, loading } = useAuth();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinkClasses = "text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-shadow duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="container flex items-center justify-between h-16 md:h-18">
        <a href="/" className="font-serif text-lg md:text-xl font-semibold text-primary">
          MainStreetIRL
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <a href="/admin" className={`${navLinkClasses} flex items-center gap-1`}>
                  <Shield className="w-4 h-4" />
                  Admin
                </a>
              )}
              <a href="/dashboard" className={navLinkClasses}>
                Dashboard
              </a>
              <a href="/discover" className={navLinkClasses}>
                Discover
              </a>
              <a href="/onboarding/my-profile" className={navLinkClasses}>
                My Profile
              </a>
              <a href="/places" className={navLinkClasses}>
                Places
              </a>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <a href="/places" className={navLinkClasses}>
                Places
              </a>
              <a href="/blog" className={navLinkClasses}>
                Blog
              </a>
              <a href="/#how-it-works" className={navLinkClasses}>
                How It Works
              </a>
              <a href="/auth" className={navLinkClasses}>
                Sign In
              </a>
              <Button variant="accent" size="sm" onClick={() => navigate('/auth?mode=signup')}>
                Join the Waitlist
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
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
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <a 
                    href="/admin" 
                    className="flex items-center gap-2 py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </a>
                )}
                <a 
                  href="/dashboard" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </a>
                <a 
                  href="/discover" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Discover
                </a>
                <a 
                  href="/onboarding/my-profile" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </a>
                <a 
                  href="/places" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Places
                </a>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={handleSignOut}
                >
                  Sign Out
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <a 
                  href="/places" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Places
                </a>
                <a 
                  href="/blog" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </a>
                <a 
                  href="/#how-it-works" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a 
                  href="/auth" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
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
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
