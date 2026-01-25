import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Users, Mountain, Tent, Compass } from "lucide-react";

const FindFriends = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const ghostY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <PageLayout>
      <SEOHead
        title="Find Gay Outdoor Friends – Make Real Connections on the Trail"
        description="Looking for gay friends who love the outdoors and staying active? Discover trails, campsites, and outdoor spots where you can find community — not on dating apps."
        keywords="find gay hiking friends, gay outdoor friends, gay camping buddies, gay men hiking, LGBTQ outdoor community, gay active lifestyle, gay running buddies, gay cycling friends"
        canonicalPath="/find-friends"
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
            ♂
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
              Friendship
            </span>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 text-balance">
              How Do Outdoor Gay Men Find Friends?
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Not on dating apps. Not through algorithms. 
              Through showing up — on the trail, at the campsite, in real life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Challenge Section */}
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
                The Friendship Gap
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Finding gay friends who love the outdoors is harder than anyone admits. 
                Dating apps aren't designed for friendship. The bar scene doesn't fit 
                your lifestyle. And the trails, campsites, and beaches where you'd 
                naturally connect with others like you feel harder to discover.
              </p>
              <p>
                If you're single, the pressure to date can make platonic connection 
                feel like a consolation prize. If you're partnered, you might find 
                that your social world shrinks, or that finding outdoor friends as 
                a couple feels awkward.
              </p>
              <p>
                And if you're introverted, new to an area, or simply prefer nature 
                over nightlife? The challenge multiplies. Where do you even start?
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Place-First Approach Section */}
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
                Place-First Friendship
              </h2>
            </div>

            <div className="prose prose-lg prose-invert max-w-none text-primary-foreground/90">
              <p>
                The best friendships don't happen because an algorithm matched your 
                interests. They happen because you kept showing up to the same place. 
                The trail you hike every Saturday. The campsite you return to each season. 
                The beach where you recognize the same faces.
              </p>
              <p>
                ThickTimber helps you find those places — the ones where gay men who 
                love the outdoors already gather in your region. Not to force connection, 
                but to create the conditions where it can happen naturally.
              </p>
              <p>
                We believe friendship starts with presence. With being a regular. 
                With the slow accumulation of nods, hellos, and eventually real 
                conversation — on the trail, around the campfire.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Where Friendships Form Section */}
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
                Where Friendships Actually Form
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Mountain,
                  title: "Trail Runs & Active Hikes",
                  description: "The trails where you see the same faces. Where shared pursuit — running, hiking, or just moving — creates natural bonding."
                },
                {
                  icon: Tent,
                  title: "Camping Trips",
                  description: "Campgrounds and backcountry sites where evening conversations happen naturally around the fire."
                },
                {
                  icon: Compass,
                  title: "Group Hikes & Active Meetups",
                  description: "Hiking groups, running crews, cycling meetups, camping weekends. Consistency builds familiarity, and familiarity builds friendship."
                },
                {
                  icon: Users,
                  title: "Beach Days & Swimming Holes",
                  description: "The summer gathering spots. Places where community forms in the sunlight and shallow water."
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

      {/* Not a Social Network Section */}
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
                Not Another Social Network
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                We're not building another app where you browse profiles and hope 
                for the best. ThickTimber is a directory — a collection of outdoor 
                places curated by and for gay men who love nature.
              </p>
              <p>
                There are no public profiles. No feeds. No messaging. No pressure 
                to perform or compete for attention. Just places worth knowing about, 
                and the quiet intelligence that helps you find the ones that fit you.
              </p>
              <p>
                Whether you're single and looking for <Link to="/community" className="text-primary hover:underline">community</Link> or 
                in a <Link to="/couples" className="text-primary hover:underline">couple</Link> looking 
                to expand your outdoor circle, the path is the same: find the trails, 
                show up consistently, let connection happen.
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
              Discover the outdoor spots where gay men who love nature gather — 
              and start building the friendships you've been missing.
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

export default FindFriends;
