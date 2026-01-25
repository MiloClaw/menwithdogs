import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Mountain, Tent, Waves, Compass } from "lucide-react";

const Community = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const ghostY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <PageLayout>
      <SEOHead
        title="Gay Outdoor Community – Find Your People on the Trail"
        description="Discover outdoor community for gay men who stay active outside. A place-centric directory for hiking trails, campsites, beaches, and nature spots — not dating apps or social networks."
        keywords="gay outdoor community, LGBTQ hiking, gay camping, gay men outdoors, gay nature lovers, gay hiking groups, gay active lifestyle, gay running community"
        canonicalPath="/community"
      />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-20 md:py-28 lg:py-36 overflow-hidden"
      >
        <motion.div
          style={{ y: ghostY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="text-[18rem] md:text-[24rem] lg:text-[32rem] font-serif text-muted/[0.04] leading-none">
            &
          </span>
        </motion.div>

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Community
            </span>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 text-balance">
              What Is Gay Outdoor Community?
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Community isn't an app. It's the trails you keep returning to — 
              and the people you meet when you show up.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Reality Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="mb-8">
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                01
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                The Reality
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Gay men who love the outdoors — hiking, camping, beaches, swimming holes — 
                often feel disconnected from the broader gay community. The bar scene doesn't 
                fit. Dating apps feel exhausting. And finding other gay men who share your 
                love of nature feels almost accidental.
              </p>
              <p>
                But somewhere along the way, we moved everything online. Apps promised 
                connection but delivered endless scrolling, performative profiles, and 
                a strange kind of loneliness that comes from being surrounded by options 
                but never quite connecting.
              </p>
              <p>
                Meanwhile, the trails, campsites, and outdoor spaces where community could 
                form feel harder to discover. Especially if you're new to an area, newly out, 
                or simply looking for something beyond dating.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We're Building Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="mb-8">
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-primary-foreground/70 mb-3">
                02
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                A Different Approach
              </h2>
            </div>

            <div className="prose prose-lg prose-invert max-w-none text-primary-foreground/90">
              <p>
                ThickTimber is a place-centric directory — a curated collection of 
                outdoor spaces where gay men who love nature already gather. Hiking trails 
                with welcoming energy. Campsites where you might find others. Beaches and 
                swimming holes worth knowing about.
              </p>
              <p>
                We help you discover these places in your region and, over time, learn 
                which ones resonate with people like you. Not through algorithms chasing 
                engagement, but through quiet patterns that emerge when outdoor gay men 
                share what matters to them.
              </p>
              <p>
                This isn't a social network. There are no profiles to browse, no feeds 
                to scroll, no DMs to manage. Just places — and the possibility of 
                connection that comes from showing up in real life.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Places That Matter Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12 text-center">
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                03
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                The Places That Matter
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Mountain,
                  title: "Hiking Trails",
                  description: "The trails where regulars become familiar faces. Where a nod becomes a hello, and a hello becomes a conversation."
                },
                {
                  icon: Tent,
                  title: "Campsites",
                  description: "Campgrounds where showing up consistently creates connection. Around the fire, under the stars."
                },
                {
                  icon: Waves,
                  title: "Beaches & Swimming Holes",
                  description: "The hidden gems and local favorites. Places where community forms naturally in the summer months."
                },
                {
                  icon: Compass,
                  title: "Group Events",
                  description: "Hiking groups, camping weekends, outdoor meetups. The gatherings that bring outdoor gay men together."
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 bg-card border border-border rounded-lg"
                >
                  <item.icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-16 md:py-24 bg-surface/50">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="mb-8">
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                04
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                Who This Is For
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                This is for gay men who feel more at ease on a trail than in a crowded bar. 
                Men who love hiking, camping, beaches, and staying active outside — and wonder where others 
                like them actually go.
              </p>
              <p>
                Whether you're a hiker, a runner, a cyclist, or someone who just feels better after time outdoors — 
                you're welcome here.
              </p>
              <p>
                It's for single men looking for <Link to="/find-friends" className="text-primary hover:underline">friends</Link> who share their love of staying active outdoors, 
                not just dates. For <Link to="/couples" className="text-primary hover:underline">couples</Link> who 
                want to find others to explore with. For introverts who prefer a quiet 
                trail over crowded spaces.
              </p>
              <p>
                It's for anyone tired of the performance of dating apps and ready 
                to invest in real places and real presence — outdoors.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-primary-foreground/70 mb-4">
              Start Here
            </span>
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-4 text-balance">
              Ready to find your trail?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Discover the outdoor spaces where gay men who love nature already gather.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base px-8"
              >
                <Link to="/auth?mode=signup">Create Free Account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/places">Explore Outdoors</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Community;
