import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const freeFeatures = [
  "Explore the full directory of places and events",
  "Save favorite places and events",
  "Personalized ordering based on what you view and save",
  "Location-aware suggestions",
  "Evergreen local stories connected to places",
  "Your data is private and never shared",
];

const proFeatures = [
  "Everything in Free",
  "Deeper personalization inputs (optional)",
  "Activity patterns (mornings, evenings, live events)",
  "Environment preferences (outdoor seating, quieter places)",
  "Community and interest context",
  "Improved relevance as more data is collected over time",
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout, isCreatingCheckout, isPro } = useSubscription();

  const handleFreeCTA = () => {
    if (user) {
      navigate("/places");
    } else {
      navigate("/auth");
    }
  };

  const handleProCTA = () => {
    if (user) {
      createCheckout();
    } else {
      navigate("/auth?redirect=pricing");
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Simple Pricing"
        subtitle="Choose what works for you"
      />

      <div className="container py-8 md:py-12 lg:py-16">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-8">
          {/* Free Plan */}
          <div className="rounded-card p-6 md:p-8 bg-card border border-border">
            <div className="mb-6">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-2">
                Free
              </h3>
              <div className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
                $0
              </div>
              <p className="text-sm text-muted-foreground">
                Get relevant places and events based on your activity.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 mt-0.5 text-secondary" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleFreeCTA}
            >
              {user ? "Explore places" : "Get started"}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="rounded-card p-6 md:p-8 bg-card border border-border">
            <div className="mb-6">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-2">
                Pro Personalization
              </h3>
              <div className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
                $4.99
                <span className="text-base font-normal text-muted-foreground">
                  {" "}/ month
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Add more context so recommendations fit you better.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 mt-0.5 text-secondary" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant="default"
              className="w-full"
              onClick={handleProCTA}
              disabled={isCreatingCheckout || isPro}
            >
              {isPro ? "Current plan" : isCreatingCheckout ? "Loading..." : "Add personalization"}
            </Button>
          </div>
        </div>

        {/* Reassurance Text */}
        <p className="text-center text-sm text-muted-foreground mb-12">
          You can upgrade or downgrade at any time.
        </p>

        {/* Bottom Message */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Both plans give you access to the same places and events. 
            Pro Personalization simply helps order results based on more context about your preferences.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
