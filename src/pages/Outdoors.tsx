import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Mountain, Tent, Waves, Compass, ArrowRight } from "lucide-react";

const Outdoors = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const placeTypes = [
    {
      icon: Mountain,
      title: "Hiking Trails",
      description: "The places where conversation happens without forcing it.",
    },
    {
      icon: Tent,
      title: "Campsites",
      description: "Where familiarity builds over time — sometimes just by showing up again.",
    },
    {
      icon: Waves,
      title: "Swimming Holes",
      description: "The spots you usually hear about from someone else, not the internet.",
    },
    {
      icon: Compass,
      title: "Outdoor Events",
      description: "Group hikes, camping weekends, trail days. Low pressure. Optional. Real.",
    },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="Gay Outdoors - Community, Outside the Usual Places"
        description="A directory for gay men who love hiking, camping, and staying active outdoors. Find trails, campsites, and swimming holes where outdoor gay men connect."
        keywords="gay hiking, gay camping, LGBTQ outdoors, gay backpacking, gay nature, gay trail community, outdoor gay men, gay active lifestyle, gay running groups"
        canonicalPath="/outdoors"
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax ghost ampersand */}
        <motion.span
          style={{ y: ghostY }}
          className="pointer-events-none select-none absolute text-[40vw] md:text-[30vw] font-serif text-primary/5 leading-none"
          aria-hidden
        >
          &
        </motion.span>

        <div className="container relative z-10 text-center px-4 py-20 md:py-32">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-6"
          >
            Outdoors
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground max-w-4xl mx-auto leading-tight"
          >
            Community, Outside the Usual Places
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Not everyone finds connection in bars or cafés. Some of us find it on trails, around campfires, or just being active outside long enough to feel like ourselves again.
          </motion.p>
        </div>
      </section>

      {/* Section 01 - The Reality */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-4"
            >
              01 — The Reality
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="prose prose-lg text-foreground/80"
            >
              <p>
                There are a lot of gay men who love being outdoors. We just don't always know where to find each other.
              </p>
              <p>
                The apps don't really help with that. And a lot of traditional gay spaces aren't built around hiking, camping, or spending a long afternoon outside.
              </p>
              <p>
                So most of the time, it's left to chance. You show up at a trailhead. You wonder who else might be like you. You go home without really knowing.
              </p>
              <p>
                That doesn't mean the community isn't there. It just hasn't had a place to gather.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 02 - A Different Way In */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary-foreground/70 mb-4"
            >
              02 — A Different Way In
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl mb-8"
            >
              A Different Way In
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg prose-invert text-primary-foreground/80"
            >
              <p>
                This is an attempt to change that — quietly.
              </p>
              <p>
                Instead of profiles or feeds, this is built around places. Trails. Campsites. Swimming holes. Outdoor spots where people already go.
              </p>
              <p>
                You can add places you know. Save the ones you return to. Over time, patterns start to form — not publicly, not performatively — just enough to make the next step feel easier.
              </p>
              <p>
                Right now, it's about discovery. Down the line, for those who want it, PRO will add simple ways to connect and talk — without turning it into another app you have to manage.
              </p>
              <p>
                The goal isn't to rush anything. It's to make it easier for real connections to happen naturally.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 03 - The Places That Matter */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-4"
            >
              03 — The Places That Matter
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-foreground mb-12"
            >
              The Places That Matter
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {placeTypes.map((place, index) => (
                <motion.div
                  key={place.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-lg border border-border bg-card"
                >
                  <place.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-serif text-xl text-foreground mb-2">
                    {place.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {place.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 04 - Who This Is For */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-4"
            >
              04 — Who This Is For
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-foreground mb-8"
            >
              Who This Is For
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg text-foreground/80"
            >
              <p>
                This is for gay men who feel more at ease outside than in crowded rooms.
              </p>
              <p>
                Whether you're a hiker, a runner, a cyclist, or just someone who feels better after time outside — this is for you.
              </p>
              <p>
                For guys who hike alone but wouldn't mind company. For{" "}
                <Link to="/couples" className="text-primary hover:underline">
                  couples
                </Link>{" "}
                looking for outdoor friends. For people who've moved somewhere new and don't know where to start.
              </p>
              <p>
                You don't need to be an expert. You don't need to be especially social. If staying active outdoors helps you feel more like yourself, you'll probably feel at home here.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary-foreground/70 mb-4"
            >
              Start Here
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6"
            >
              Ready to start exploring?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto"
            >
              Discover the outdoor places where connection already exists — quietly, over time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-base"
              >
                <Link to="/auth?mode=signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/places">Explore Outdoors</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Outdoors;
