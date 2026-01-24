import { Link } from "react-router-dom";
const Footer = () => {
  const linkClasses = "text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-foreground after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left";
  return <footer className="py-12 md:py-16 bg-primary">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-serif text-lg font-semibold text-primary-foreground">
              MainStreetIRL
            </span>
            <p className="text-sm text-primary-foreground/70 mt-2">Real places. 
Real community. 
Real Connection.
          </p>
          </div>
          
          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-primary-foreground mb-3">
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
            <h4 className="text-sm font-semibold text-primary-foreground mb-3">
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
            <h4 className="text-sm font-semibold text-primary-foreground mb-3">
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
            <h4 className="text-sm font-semibold text-primary-foreground mb-3">
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
        
        {/* Bottom */}
        <div className="pt-8 md:pt-10 border-t border-primary-foreground/20 space-y-3">
          <p className="text-xs text-primary-foreground/60 text-center max-w-lg mx-auto">
            MainStreetIRL provides place-based insights and community signals. Users choose how and where they engage independently.
          </p>
          <p className="text-sm text-primary-foreground/70 text-center">
            © {new Date().getFullYear()} MainStreetIRL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;