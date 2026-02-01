import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import BrandLockup from "@/components/BrandLockup";
import BrandStripe from "@/components/BrandStripe";
import SEOHead from "@/components/SEOHead";
import { MapPin, Home, Search } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Explore outdoor places shaped by shared interests on ThickTimber."
        canonicalPath="/404"
      />
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        {/* Ghost Typography Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] md:text-[20vw] font-serif font-bold text-primary/[0.03] select-none pointer-events-none"
        >
          404
        </motion.div>

        {/* Header */}
        <header className="p-4 md:p-6 relative z-10">
          <Link to="/">
            <BrandLockup size="sm" showSubtitle={false} />
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 pb-8 relative z-10">
          <div className="text-center max-w-md space-y-8">
            {/* Brand accent */}
            <BrandStripe size="md" className="mx-auto" />

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">
                Trail Not Found
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                This path doesn't exist
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed text-pretty">
                Looks like you've ventured off the map. The page you're looking for isn't here—but plenty of outdoor places are waiting to be explored.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
            >
              <Button asChild variant="accent" className="min-h-[44px]">
                <Link to="/places">
                  <MapPin className="w-4 h-4 mr-2" />
                  Explore Places
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-[44px]">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-4 border-t border-border/50"
            >
              <p className="text-xs text-muted-foreground mb-3">
                Looking for something specific?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link
                  to="/places/explore"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Explore Cities
                </Link>
                <span className="text-muted-foreground/50">·</span>
                <Link
                  to="/places/national-parks"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  National Parks
                </Link>
                <span className="text-muted-foreground/50">·</span>
                <Link
                  to="/faq"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  FAQ
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default NotFound;
