import { Shield } from "lucide-react";

const privacyPoints = [
  "No public profiles",
  "No searchable users",
  "No shared personal details without explicit opt-in",
  "No selling or indexing of your data",
];

const PrivacyTrust = () => {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border">
      <div className="container max-w-xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Privacy & Trust, by Design
          </h2>
        </div>

        <ul className="space-y-3 max-w-sm mx-auto">
          {privacyPoints.map((point, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
              <span className="text-foreground text-sm md:text-base">
                {point}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground text-center mt-8 text-sm md:text-base font-medium">
          You control when, where, and how you're visible—always.
        </p>
      </div>
    </section>
  );
};

export default PrivacyTrust;
