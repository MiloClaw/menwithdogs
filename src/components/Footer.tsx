import { Link } from "react-router-dom";
import BrandLockup from "@/components/BrandLockup";

const Footer = () => {
  const linkClasses = "text-sm text-primary-foreground/50 hover:text-accent transition-colors duration-300";
  
  return (
    <footer className="py-20 md:py-28 bg-primary">
      <div className="container max-w-6xl">
        {/* Main Grid: Brand + Links */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-12 lg:gap-16">
          
          {/* Zone A: Brand Anchor */}
          <div className="space-y-6">
            <BrandLockup size="lg" variant="dark" showStripe centered />
            <p className="font-serif text-sm italic text-primary-foreground/60">
              Real places. Real community. Real connection.
            </p>
          </div>
          
          {/* Zone B: Link Columns */}
          
          {/* Explore */}
          <div>
            <h4 className="text-sm font-medium text-primary-foreground/70 mb-4">
              Explore
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/places" className={linkClasses}>
                Places
              </Link>
          <Link to="/outdoors" className={linkClasses}>
            Outdoors
          </Link>
          <Link to="/places/national-parks" className={linkClasses}>
            National Parks
          </Link>
              <Link to="/together" className={linkClasses}>
                Discover Together
              </Link>
            </nav>
          </div>
          
          {/* Use Cases */}
          <div>
            <h4 className="text-sm font-medium text-primary-foreground/70 mb-4">
              Use Cases
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/community" className={linkClasses}>
                Outdoor Community
              </Link>
              <Link to="/find-friends" className={linkClasses}>
                Friends & Groups
              </Link>
              <Link to="/couples" className={linkClasses}>
                Couples
              </Link>
            </nav>
          </div>
          
          {/* About */}
          <div>
            <h4 className="text-sm font-medium text-primary-foreground/70 mb-4">
              About
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/about" className={linkClasses}>
                Why ThickTimber
              </Link>
              <Link to="/ambassadors" className={linkClasses}>
                Trail Blazers
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
            <h4 className="text-sm font-medium text-primary-foreground/70 mb-4">
              Legal
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/terms" className={linkClasses}>
                Terms of Service
              </Link>
              <Link to="/privacy" className={linkClasses}>
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-16 md:mt-20 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} ThickTimber. All rights reserved.
          </p>
          <Link to="/sitemap" className="text-sm text-primary-foreground/40 hover:text-primary-foreground/60 transition-colors">
            Sitemap
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
