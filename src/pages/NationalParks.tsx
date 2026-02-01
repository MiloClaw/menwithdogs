import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Mountain, ChevronDown, MapPin, Calendar, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { groupParksByState, getParkStats, NationalPark } from '@/lib/national-parks-data';

const NationalParks = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const stateParks = groupParksByState();
  const stats = getParkStats();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.5], [0.04, 0]);

  const formatAcreage = (acreage: number) => {
    if (acreage >= 1000000) {
      return `${(acreage / 1000000).toFixed(1)}M acres`;
    }
    return `${(acreage / 1000).toFixed(0)}K acres`;
  };

  const seoSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "US National Parks Directory",
    "description": "Complete list of all 63 US National Parks organized by state",
    "numberOfItems": stats.totalParks,
    "itemListElement": stateParks.flatMap((state, stateIdx) =>
      state.parks.map((park, parkIdx) => ({
        "@type": "ListItem",
        "position": stateIdx * 10 + parkIdx + 1,
        "item": {
          "@type": "Place",
          "name": park.name,
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": park.lat,
            "longitude": park.lng
          },
          "url": park.npsUrl
        }
      }))
    )
  };

  return (
    <PageLayout>
      <SEOHead
        title="US National Parks Directory - All 63 Parks by State"
        description="Explore all 63 US National Parks organized by state. Find park details, locations, and discover outdoor adventures across America's natural treasures."
        keywords="national parks, US national parks, national park directory, hiking, outdoor adventure, nature travel, camping"
        canonicalPath="/places/national-parks"
        schema={seoSchema}
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
        <motion.div 
          style={{ y: ghostY, opacity: ghostOpacity }} 
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="text-[16rem] md:text-[24rem] font-serif text-foreground leading-none">63</span>
        </motion.div>

        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/places')} 
              className="gap-2 -ml-2 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />Back to Directory
            </Button>
          </motion.div>

          <div className="max-w-3xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }} 
              className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
            >
              National Parks
            </motion.span>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.15 }} 
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance mb-6"
            >
              America's Natural Treasures
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }} 
              className="text-lg md:text-xl text-muted-foreground text-pretty mb-8"
            >
              Explore all <span className="text-foreground font-medium">{stats.totalParks} National Parks</span> across{' '}
              <span className="text-foreground font-medium">{stats.statesCount} states and territories</span> — 
              over {(stats.totalAcreage / 1000000).toFixed(0)}M acres of protected wilderness.
            </motion.p>

            {/* Stats Row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-6 text-sm"
            >
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4 text-brand-green" />
                <span className="text-muted-foreground">
                  Since <span className="text-foreground font-medium">{stats.oldestPark.established}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mountain className="h-4 w-4 text-brand-amber" />
                <span className="text-muted-foreground">
                  First park: <span className="text-foreground font-medium">{stats.oldestPark.name}</span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Parks by State */}
      <section className="pb-20 md:pb-28">
        <div className="container">
          <Accordion 
            type="multiple" 
            defaultValue={stateParks.length > 0 ? [stateParks[0].stateAbbr] : []} 
            className="space-y-4"
          >
            {stateParks.map((state, idx) => (
              <motion.div 
                key={state.stateAbbr} 
                initial={{ opacity: 0, y: 24 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-50px" }} 
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <AccordionItem 
                  value={state.stateAbbr} 
                  className="border border-border rounded-lg bg-card overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-accent/30 transition-colors [&[data-state=open]>div>.chevron]:rotate-180">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <span className="hidden sm:block text-4xl md:text-5xl font-serif font-bold text-muted-foreground/10">
                          {state.stateAbbr}
                        </span>
                        <div className="text-left">
                          <h3 className="font-serif text-xl md:text-2xl font-semibold tracking-tight">
                            {state.stateName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {state.parks.length} {state.parks.length === 1 ? 'park' : 'parks'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground chevron transition-transform duration-200" />
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {state.parks.map((park) => (
                        <ParkCard key={park.id} park={park} formatAcreage={formatAcreage} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-brand-navy text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-4">
              Discover More Outdoor Places
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              Our directory includes trails, campsites, swimming holes, and more curated spots for outdoor enthusiasts.
            </p>
            <Button 
              onClick={() => navigate('/places')} 
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Explore the Directory
            </Button>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

// Park Card Component
interface ParkCardProps {
  park: NationalPark;
  formatAcreage: (acreage: number) => string;
}

const ParkCard = ({ park, formatAcreage }: ParkCardProps) => {
  return (
    <Link
      to={`/places/national-parks/${park.id}`}
      className="group flex flex-col p-4 rounded-lg border border-border bg-background transition-all hover:bg-accent/50 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 p-2 rounded-full bg-brand-green/10 group-hover:bg-brand-green/20 transition-colors">
          <Mountain className="h-4 w-4 text-brand-green" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground leading-tight mb-1 group-hover:text-brand-green transition-colors">
            {park.name.replace(' National Park', '')}
          </h4>
          {park.states.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {park.states.join(', ')}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
        {park.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Est. {park.established}
        </span>
        <span>{formatAcreage(park.acreage)}</span>
      </div>
    </Link>
  );
};

export default NationalParks;
