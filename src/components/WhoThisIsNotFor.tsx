import { X } from "lucide-react";

const exclusions = [
  "Not a dating app",
  "No hookups",
  "No public profiles",
  "No likes, swipes, or popularity mechanics",
];

const WhoThisIsNotFor = () => {
  return (
    <section className="py-16 md:py-20 bg-surface/50 border-t border-border">
      <div className="container max-w-xl">
        <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-8 text-center tracking-tight">
          To Be Clear
        </h2>
        
        <ul className="space-y-4 max-w-sm mx-auto">
          {exclusions.map((item, index) => (
            <li key={index} className="flex items-center gap-3">
              <X className="w-5 h-5 text-destructive shrink-0" />
              <span className="text-foreground text-sm md:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground text-center mt-8 text-sm md:text-base max-w-md mx-auto">
          If you're looking to browse people or chase attention, this isn't the place.
        </p>
      </div>
    </section>
  );
};

export default WhoThisIsNotFor;
