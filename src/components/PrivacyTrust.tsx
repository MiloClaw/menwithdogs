import { Shield } from "lucide-react";

const privacyPoints = [
  "Nothing is public by default",
  "No one can see what you've saved",
  "Your browsing history stays private",
  "Used only to improve your experience",
];

const PrivacyTrust = () => {
  return (
    <section className="py-20 md:py-28 bg-surface/50 border-t border-border">
      <div className="container max-w-xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Your activity is yours.
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
          You're in control. Always.
        </p>
      </div>
    </section>
  );
};

export default PrivacyTrust;
