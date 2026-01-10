import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Shield, Heart, Settings } from "lucide-react";

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
        <Link to="/" className="font-serif text-lg md:text-xl font-semibold text-primary">
          MainStreetIRL
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className={`${navLinkClasses} flex items-center gap-1`}>
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link to="/settings" className={`${navLinkClasses} flex items-center gap-1`}>
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link to="/places" className={navLinkClasses}>
                Places
              </Link>
              <Link to="/blog" className={navLinkClasses}>
                Blog
              </Link>
              <Link to="/saved" className={`${navLinkClasses} flex items-center gap-1`}>
                <Heart className="w-4 h-4" />
                Saved
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/places" className={navLinkClasses}>
                Places
              </Link>
              <Link to="/blog" className={navLinkClasses}>
                Blog
              </Link>
              <Link to="/#how-it-works" className={navLinkClasses}>
                How It Works
              </Link>
              <Link to="/auth" className={navLinkClasses}>
                Sign In
              </Link>
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
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link 
                  to="/settings"
                  className="flex items-center gap-2 py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link 
                  to="/places" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Places
                </Link>
                <Link 
                  to="/blog" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  to="/saved" 
                  className="flex items-center gap-2 py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-4 h-4" />
                  Saved
                </Link>
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
                <Link 
                  to="/places" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Places
                </Link>
                <Link 
                  to="/blog" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  to="/#how-it-works" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link 
                  to="/auth" 
                  className="block py-2 text-sm font-medium text-primary hover:text-accent transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
