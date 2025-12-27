import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const pricingTiers = [
  {
    name: "Free",
    price: "Free",
    description: "Get started exploring local experiences",
    features: [
      "Discover local spots",
      "Read community reviews",
      "Save favorite places",
      "Basic search filters",
    ],
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$9/month",
    description: "Enhanced features for active couples",
    features: [
      "Everything in Free",
      "Personalized recommendations",
      "Priority access to events",
      "Advanced search & filters",
      "Exclusive member content",
    ],
    highlighted: true,
  },
  {
    name: "Founding Members",
    price: "$79/year",
    description: "Early supporter benefits for life",
    features: [
      "Everything in Premium",
      "Lifetime founding member badge",
      "Early access to new features",
      "Direct input on roadmap",
      "Special founding member events",
    ],
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Simple, Transparent Pricing" 
        subtitle="Coming Soon" 
      />
      
      <div className="container py-8 md:py-12 lg:py-16">
        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-card p-6 md:p-8 ${
                tier.highlighted
                  ? "bg-primary text-primary-foreground ring-2 ring-accent"
                  : "bg-card border border-border"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className={`font-serif text-xl md:text-2xl font-semibold mb-2 ${
                  tier.highlighted ? "text-primary-foreground" : "text-foreground"
                }`}>
                  {tier.name}
                </h3>
                <div className={`text-3xl md:text-4xl font-semibold mb-2 ${
                  tier.highlighted ? "text-primary-foreground" : "text-foreground"
                }`}>
                  {tier.price}
                </div>
                <p className={`text-sm ${
                  tier.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {tier.description}
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 shrink-0 mt-0.5 ${
                      tier.highlighted ? "text-accent" : "text-secondary"
                    }`} />
                    <span className={`text-sm ${
                      tier.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Button
                variant={tier.highlighted ? "accent" : "outline"}
                className="w-full"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          ))}
        </div>
        
        {/* Bottom Message */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
            We're Still Building
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            MainStreetIRL is currently in development. We're focused on creating something 
            genuinely useful for couples who want to explore their local communities together.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Pricing details will be finalized closer to launch. Join our waitlist to be the 
            first to know when we're ready—and to secure early access benefits.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
