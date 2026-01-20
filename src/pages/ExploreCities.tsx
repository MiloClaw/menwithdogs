import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowLeft, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageLayout from '@/components/PageLayout';
import { useExploreHierarchy, ExploreState, ExploreCity } from '@/hooks/useExploreHierarchy';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ExploreCities = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const { data: hierarchy, isLoading, error } = useExploreHierarchy();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.5], [0.04, 0]);

  const handleSelectCity = (city: ExploreCity) => {
    const params = new URLSearchParams();
    params.set('city', city.name);
    if (city.state) params.set('state', city.state);
    navigate(`/places?${params.toString()}`);
  };

  const totalCities = hierarchy?.reduce((sum, s) => sum + s.cities.length, 0) || 0;
  const totalPlaces = hierarchy?.reduce((sum, s) => sum + s.total_places, 0) || 0;

  return (
    <PageLayout>
      <section ref={heroRef} className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
        <motion.div style={{ y: ghostY, opacity: ghostOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[20rem] md:text-[28rem] font-serif text-foreground leading-none">◎</span>
        </motion.div>

        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/places')} className="gap-2 -ml-2 mb-8">
              <ArrowLeft className="h-4 w-4" />Back to Directory
            </Button>
          </motion.div>

          <div className="max-w-3xl">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Explore
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance mb-6">
              Browse by Location
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground text-pretty">
              Discover curated places across {totalCities > 0 ? <span className="text-foreground font-medium">{totalCities} {totalCities === 1 ? 'city' : 'cities'}</span> : 'cities'} we've launched
              {totalPlaces > 0 && <span> — {totalPlaces} places and counting</span>}
            </motion.p>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container">
          {isLoading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
          ) : error ? (
            <div className="text-center py-16"><p className="text-muted-foreground">Unable to load cities</p></div>
          ) : hierarchy && hierarchy.length > 0 ? (
            <Accordion type="multiple" defaultValue={hierarchy.length > 0 ? [hierarchy[0].state_abbr] : []} className="space-y-4">
              {hierarchy.map((state, idx) => (
                <motion.div key={state.state_abbr} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: idx * 0.1 }}>
                  <AccordionItem value={state.state_abbr} className="border border-border rounded-lg bg-card overflow-hidden">
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-accent/30 transition-colors [&[data-state=open]>div>.chevron]:rotate-180">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <span className="hidden sm:block text-4xl md:text-5xl font-serif font-bold text-muted-foreground/10">{state.state_abbr}</span>
                          <div className="text-left">
                            <h3 className="font-serif text-xl md:text-2xl font-semibold tracking-tight">{state.state}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{state.cities.length} {state.cities.length === 1 ? 'city' : 'cities'} • {state.total_places} places</p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground chevron transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="pt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {state.cities.map((city) => (
                          <button key={city.id} onClick={() => handleSelectCity(city)} className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-background text-left transition-all hover:bg-accent/50 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[72px]">
                            <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{city.name}</p>
                              <p className="text-sm text-muted-foreground">{city.place_count} {city.place_count === 1 ? 'place' : 'places'}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="p-4 rounded-full bg-muted w-fit mx-auto"><MapPin className="h-8 w-8 text-muted-foreground" /></div>
              <p className="font-serif text-xl font-medium">No cities available yet</p>
              <p className="text-muted-foreground text-sm">We're working on adding more cities soon.</p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default ExploreCities;
