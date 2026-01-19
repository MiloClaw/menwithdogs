import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Heart, Users, Shield, MapPin, Coffee, Sparkles } from "lucide-react";
const values = [{
  icon: Shield,
  title: "Privacy by Default",
  description: "No public profiles. No searchable users. Your presence is yours to control—always."
}, {
  icon: Heart,
  title: "Platonic Intention",
  description: "Built for friendship and community, not dating. Real connection without the pressure."
}, {
  icon: MapPin,
  title: "Place-First Discovery",
  description: "The places come first. Community forms around them naturally, not the other way around."
}, {
  icon: Users,
  title: "Quiet Community",
  description: "No likes, followers, or popularity mechanics. Just shared spaces and genuine moments."
}];
const About = () => {
  return <PageLayout>
      <PageHeader title="Why We Built This" subtitle="The story behind MainStreetIRL" />

      <div className="container py-8 md:py-12 lg:py-16">
        {/* The Problem */}
        <section className="max-w-prose mb-12 md:mb-16">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-6">
            The Problem We Saw
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
            Gay community has always been built in real places—bars, coffee shops, gyms, 
            neighborhood spots. But somewhere along the way, we moved everything online. 
            Apps that promised connection delivered endless scrolling, ghosting, and 
            performative profiles instead.
          </p>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
            We watched as community spaces closed. We felt the fatigue of apps designed 
            to keep us online, not help us show up. We noticed how hard it had become 
            to just... meet people. Not to date. Just to connect.
          </p>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Single or partnered, introvert or social, new to a city or deeply rooted—the 
            problem was the same: where do you actually go to find your people?
          </p>
        </section>

        {/* What We're Building */}
        <section className="mb-12 md:mb-16 py-8 md:py-12 px-6 md:px-8 bg-surface rounded-lg">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-6">
            What We're Building
          </h2>
          <div className="max-w-prose">
            <p className="text-base md:text-lg text-foreground font-medium mb-4">
              A quiet layer beneath your city.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              MainStreetIRL is a private directory of places where gay community already 
              gathers—curated by people who understand, not algorithms chasing engagement.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We help you discover coffee shops, gyms, bars, events, and neighborhood spots. 
              Places where real life actually happens. And over time, we help you find places 
              where showing up feels natural.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              No messaging pressure. No awkward intros. Just a clear signal that connection 
              is welcome—when and where you want it.
            </p>
          </div>
        </section>

        {/* What This Is Not */}
        <section className="mb-12 md:mb-16">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-6">
            What This Is Not
          </h2>
          <div className="max-w-prose">
            <p className="text-base md:text-lg font-medium text-foreground mb-4">
              This is not a dating app. This is not a hookup app. This is not a social network.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              There are no likes, swipes, or popularity mechanics. No public profiles or 
              searchable users. No DMs from strangers or pressure to perform.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you're looking to browse people or chase attention, this isn't the place. 
              We're building something different: a tool for people who want to show up 
              in real life, on their own terms.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-12 md:mb-16">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-8">
            Our Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map(value => <div key={value.title} className="p-6 bg-card border border-border rounded-lg">
                <value.icon className="h-7 w-7 text-primary mb-4" />
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>)}
          </div>
        </section>

        {/* The Vision */}
        <section className="mb-12 md:mb-16">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-6">
            The Vision
          </h2>
          <div className="max-w-prose">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We believe gay community can be rebuilt—not through another app that keeps 
              you scrolling, but through real places and real presence.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We're building MainStreetIRL to strengthen local connection, reduce online 
              fatigue, and lower the friction of meeting people organically. To help 
              community grow where it actually lives: on main streets, in neighborhoods, 
              at the places that matter.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              A nod. A hello. A conversation that starts where you already are.
            </p>
          </div>
        </section>

        {/* Trust & Privacy */}
        <section className="py-8 md:py-12 px-6 md:px-8 bg-surface rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
              Privacy & Trust
            </h2>
          </div>
          <div className="max-w-prose">
            <ul className="space-y-3 mb-6">
              
              
              <li className="flex items-start gap-3 text-sm md:text-base text-foreground">No public profiles. No selling of your data. 
              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-2" />
                No selling or indexing of your data
              </li>
              
            </ul>
            <p className="text-sm text-muted-foreground italic">
              Privacy isn't a feature. It's the foundation.
            </p>
          </div>
        </section>
      </div>
    </PageLayout>;
};
export default About;