import { X } from "lucide-react";

const exclusions = [
  "Not a social network",
  "Not a dating app",
  "Not a feed or popularity system",
  "No profiles, no followers, no likes",
];

const WhoThisIsNotFor = () => {
  return (
    <section className="py-20 md:py-28 bg-background border-y border-border">
      <div className="container max-w-xl">
        <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground text-center mb-8 tracking-tight">
          What this isn't
        </h2>

        <div className="flex flex-wrap gap-4 justify-center">
          {exclusions.map((text, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-muted-foreground text-sm"
            >
              <X className="h-4 w-4 text-muted-foreground/60" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoThisIsNotFor;
