import { Link } from "react-router-dom";

const Footer = () => {
  const linkClasses = "text-sm text-primary-foreground/50 hover:text-accent transition-colors duration-300";
  
  return (
    <footer className="py-20 md:py-28 bg-primary">
      <div className="container max-w-6xl">
        {/* Main Grid: Brand + Links */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 lg:gap-16">
          
          {/* Zone A: Brand Anchor */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary-foreground tracking-tight">
                ThickTimber
              </h2>
              <span className="block text-xs font-sans font-medium tracking-[0.5em] text-primary-foreground/70 uppercase mt-1">
                Social Club
              </span>
              <p className="font-serif text-sm italic text-primary-foreground/60 mt-3">
                Real places. Real community. Real connection.
              </p>
            </div>
            
            {/* Brand Stripe Accent */}
            <div className="flex gap-1.5">
              <div className="h-1 w-8 rounded-full bg-[#152638]" />
              <div className="h-1 w-8 rounded-full bg-[#C5702A]" />
              <div className="h-1 w-8 rounded-full bg-[#3F5E4A]" />
            </div>
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
              <Link to="/together" className={linkClasses}>
                Discover Together
              </Link>
            </nav>
          </div>
          
          {/* Community */}
          <div>
            <h4 className="text-sm font-medium text-primary-foreground/70 mb-4">
              Community
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/community" className={linkClasses}>
                Gay Community
              </Link>
              <Link to="/find-friends" className={linkClasses}>
                Find Friends
              </Link>
              <Link to="/couples" className={linkClasses}>
                Couples
              </Link>
            </nav>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-sm font-medium text-primary-foreground/70 mb-4">
              Company
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/about" className={linkClasses}>
                About
              </Link>
              <Link to="/faq" className={linkClasses}>
                FAQ
              </Link>
              <Link to="/pricing" className={linkClasses}>
                Pricing
              </Link>
              <Link to="/terms" className={linkClasses}>
                Terms
              </Link>
              <Link to="/privacy" className={linkClasses}>
                Privacy
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
