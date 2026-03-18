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
        title="Finding Friends Through Shared Outdoor Places"
        description="A place-based approach to friendship built around shared routines, outdoor activities, and familiar spaces. Designed for real-world connection over time."
        keywords="outdoor friends, hiking buddies, camping friends, shared activities, real-world friendship"
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
              Finding friends starts with showing up
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              The strongest friendships tend to form around shared routines and familiar places.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Section */}
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
                How It Works
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Friendship rarely comes from being matched. It grows from presence—seeing 
                the same faces, returning to the same places, sharing experiences over time.
              </p>
              <p>
                Men With Dogs supports that by helping you understand where people with similar 
                interests tend to spend time. There's no pressure to introduce yourself, no 
                expectation to perform—just better context for being in the right places.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Where Friendships Form Section */}
      <section className="py-16 md:py-24 bg-surface/50">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12 text-center">
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                02
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                Where Friendships Form
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Mountain,
                  title: "Regular Hikes & Trail Runs",
                  description: "The trails where familiarity builds over time."
                },
                {
                  icon: Tent,
                  title: "Camping Trips & Outdoor Weekends",
                  description: "Places where evening conversations happen naturally."
                },
                {
                  icon: Compass,
                  title: "Group Outings & Active Meetups",
                  description: "Low-pressure ways to be around others who share your interests."
                },
                {
                  icon: Users,
                  title: "Beaches & Swimming Holes",
                  description: "The spots people return to season after season."
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
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-8 text-balance">
              Ready to explore?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base px-8"
              >
                <Link to="/auth?mode=signup">Join Free</Link>
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

export default FindFriends;
