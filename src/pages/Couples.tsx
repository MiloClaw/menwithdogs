import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Heart, Users, MapPin, Calendar } from "lucide-react";

const Couples = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const ghostY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <PageLayout>
      <SEOHead
        title="Gay Couples Community – Find Friends & Places Together"
        description="Gay couples looking for community and friends. Discover places where partnered gay men connect with other couples and singles for real-world friendship — not dating."
        keywords="gay couples community, gay couple friends, LGBTQ couples, gay married couples, gay couples social, partnered gay men, gay couples meetup"
        canonicalPath="/couples"
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
          <span className="text-[16rem] md:text-[22rem] lg:text-[28rem] font-serif text-muted/[0.04] leading-none">
            ♥♥
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
              Couples
            </span>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 text-balance">
              Gay Couples Deserve Community Too
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Finding friends as a couple is different. 
              Here's a place built for that — together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Couples Challenge Section */}
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
                The Couples Challenge
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                When you partner up, your social world often shrinks. Friends who 
                were single start to fade away. Couple friends are hard to find — 
                and even harder to schedule. And most gay spaces still feel designed 
                for singles.
              </p>
              <p>
                Meanwhile, dating apps obviously don't work for friendship. And 
                the couple friend apps that exist tend to feel... awkward. Too 
                transactional. Too much pressure to "match" with another couple.
              </p>
              <p>
                You're left with a strange isolation: finally in a healthy 
                relationship, but missing the broader gay community you once 
                had access to.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Built for Couples Section */}
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
                Built With Couples in Mind
              </h2>
            </div>

            <div className="prose prose-lg prose-invert max-w-none text-primary-foreground/90">
              <p>
                MainStreetIRL was designed from the start for both singles and 
                couples. Couples can share a single account, discover places 
                together, and save favorites that reflect both partners' interests.
              </p>
              <p>
                We help you find places where gay community gathers — coffee shops, 
                restaurants, events, gyms — without the pressure of "meeting" anyone. 
                Just show up. Be a regular. Let connection happen naturally.
              </p>
              <p>
                Whether you want to find other couple friends or simply maintain 
                friendships with single friends, the approach is the same: discover 
                the places that fit your life, and let presence do the work.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Couples Are Looking For Section */}
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
                What Couples Are Looking For
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Users,
                  title: "Other Couple Friends",
                  description: "People who understand the rhythm of partnered life. Who can do double dates that aren't awkward."
                },
                {
                  icon: Heart,
                  title: "Welcoming Spaces",
                  description: "Places that feel comfortable for couples. Not exclusively single-focused. Not couple-only. Just... welcoming."
                },
                {
                  icon: MapPin,
                  title: "Neighborhood Regulars",
                  description: "Coffee shops, restaurants, bars near home. The spots where you can become familiar faces together."
                },
                {
                  icon: Calendar,
                  title: "Couple-Friendly Events",
                  description: "Events that work for two. Trivia nights, dinner parties, weekend activities. Things you can do together."
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

      {/* How It Works for Couples Section */}
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
                How It Works for Couples
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Couples can join MainStreetIRL with a shared account. Both partners 
                can add their interests and preferences, and the directory learns 
                what resonates with you as a unit.
              </p>
              <p>
                As you save favorites and explore, the system finds places where 
                couples like you tend to go — places that fit your shared lifestyle, 
                whether that's quiet brunch spots, active outdoor groups, or 
                low-key neighborhood bars.
              </p>
              <p>
                This isn't about "matching" with other couples. It's about 
                discovering the <Link to="/community" className="text-primary hover:underline">community</Link> that 
                already exists and <Link to="/find-friends" className="text-primary hover:underline">finding friends</Link> organically 
                by showing up together.
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
              Start Together
            </span>
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-4 text-balance">
              Ready to explore together?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Discover places in your city where couples like you actually spend time — 
              and start building the friendships you've been missing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base px-8"
              >
                <Link to="/auth?mode=signup">Create Couple Account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/places">Explore Places</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Couples;
