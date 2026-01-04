import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Heart, Users, Shield, Compass } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Authenticity",
    description: "Real places, real experiences, real connections. No sponsored placements or paid rankings.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Built for intentional connection. Every recommendation comes from people who understand.",
  },
  {
    icon: Shield,
    title: "Privacy",
    description: "Your presence is yours. We don't share your data or sell your information.",
  },
  {
    icon: Compass,
    title: "Intention",
    description: "Thoughtful discovery over endless scrolling. Quality over quantity, always.",
  },
];

const About = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Our Philosophy"
        subtitle="What MainStreetIRL is really about"
      />

      <div className="container py-8 md:py-12 lg:py-16">
        {/* Opening Statement */}
        <div className="max-w-prose mb-12 md:mb-16">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
            MainStreetIRL exists because we believe the best moments happen when you step away
            from the screen and into the world. We're building a platform that helps
            people discover the hidden gems in their own neighborhoods — the kind of places
            that become part of your story.
          </p>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            This isn't about optimizing your social life or gamifying connection. It's about
            making it easier to find that cozy corner café, the bookshop with the reading nook,
            or the trail that leads to the perfect sunset view.
          </p>
        </div>

        {/* What We Are */}
        <section className="mb-12 md:mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6">
            What We Are
          </h2>
          <div className="max-w-prose">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              MainStreetIRL is a discovery platform for people who want to explore their local
              communities. We curate recommendations for community-friendly spaces — places where you
              can actually have a conversation, share an experience, or simply enjoy being present.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We focus on the experiences that matter: intimate restaurants, quiet parks,
              interesting shops, cultural venues, and all the in-between places that make a
              neighborhood feel like home.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Every recommendation is rooted in authenticity. No venue can pay to be featured,
              and every suggestion comes from real community members who've been there.
            </p>
          </div>
        </section>

        {/* What We're Not */}
        <section className="mb-12 md:mb-16 py-8 md:py-12 px-6 md:px-8 bg-surface rounded-card">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6">
            What We're Not
          </h2>
          <div className="max-w-prose">
            <p className="text-base md:text-lg font-medium text-foreground mb-4">
              This is not a dating app.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We're not here to help you find a partner — we're here to help you find great places
              to spend time and, if you choose, connect with like-minded people. MainStreetIRL is
              built for platonic, intentional community.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We're also not a social network. You won't find follower counts, likes, or viral
              content here. Just honest recommendations and genuine discovery.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-12 md:mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-8">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 bg-card border border-border rounded-card"
              >
                <value.icon className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The Vision */}
        <section>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6">
            The Vision
          </h2>
          <div className="max-w-prose">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We envision a world where people spend less time scrolling through generic
              recommendations and more time creating memories in places that actually matter to them.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Our goal is to become the trusted guide for anyone who wants to discover their
              community — one neighborhood, one hidden gem, one shared experience at a time.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We're just getting started, and we're building this with intention. If that
              resonates with you, we'd love for you to join us on this journey.
            </p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default About;
