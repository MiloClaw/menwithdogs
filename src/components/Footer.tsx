import { Link } from "react-router-dom";
import logoBadge from "@/assets/logo-badge.png";

const Footer = () => {
  const linkClasses = "text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200";
  
  return (
    <footer className="py-16 md:py-20 lg:py-24 bg-primary">
      <div className="container max-w-6xl">
        {/* Logo - Centered Hero */}
        <div className="flex justify-center mb-12 md:mb-16">
          <img 
            src={logoBadge} 
            alt="ThickTimber - Real places. Real community. Real Connection."
            className="h-28 md:h-36 lg:h-40 w-auto object-contain"
          />
        </div>
        
        {/* Navigation Grid - 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
          {/* Explore */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Explore
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="/places" className={linkClasses}>
                Places
              </Link>
              {/* Blog link hidden - uncomment when ready to launch
              <Link to="/blog" className={linkClasses}>
                Blog
              </Link>
              */}
            </nav>
          </div>
          
          {/* Community */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Community
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="/community" className={linkClasses}>
                Gay Community
              </Link>
              <Link to="/find-friends" className={linkClasses}>
                Find Friends
              </Link>
              <Link to="/couples" className={linkClasses}>
                Couples
              </Link>
              <Link to="/outdoors" className={linkClasses}>
                Outdoors
              </Link>
              <Link to="/together" className={linkClasses}>
                Discover Together
              </Link>
            </nav>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Company
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="/about" className={linkClasses}>
                About
              </Link>
              <Link to="/faq" className={linkClasses}>
                FAQ
              </Link>
              <Link to="/pricing" className={linkClasses}>
                Pricing
              </Link>
            </nav>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Legal
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="/terms" className={linkClasses}>
                Terms of Service
              </Link>
              <Link to="/privacy" className={linkClasses}>
                Privacy Policy
              </Link>
              <Link to="/sitemap" className={linkClasses}>
                Sitemap
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-primary-foreground/10 text-center space-y-2">
          <p className="text-xs text-primary-foreground/40 max-w-md mx-auto">
            Place-based insights and community signals. Users choose how and where they engage independently.
          </p>
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} ThickTimber. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
