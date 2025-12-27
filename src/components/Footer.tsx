import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-8 md:py-12 bg-primary">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <span className="font-serif text-lg font-semibold text-primary-foreground">
              MainStreetIRL
            </span>
            <p className="text-sm text-primary-foreground/70 mt-2">
              Discover local experiences together.
            </p>
          </div>
          
          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-primary-foreground mb-3">
              Explore
            </h4>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/places" 
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Places
              </Link>
              <Link 
                to="/blog" 
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Blog
              </Link>
            </nav>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-primary-foreground mb-3">
              Company
            </h4>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/about" 
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                About
              </Link>
              <Link 
                to="/pricing" 
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Pricing
              </Link>
            </nav>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-primary-foreground mb-3">
              Legal
            </h4>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/terms" 
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/privacy" 
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <p className="text-sm text-primary-foreground/70 text-center">
            © {new Date().getFullYear()} MainStreetIRL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
