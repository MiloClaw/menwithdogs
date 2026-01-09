import { X } from "lucide-react";

const exclusions = [
  "Not a dating app",
  "No hookups", 
  "No public profiles",
  "No likes, swipes, or popularity mechanics"
];

const WhoThisIsNotFor = () => {
  return (
    <section className="py-12 bg-background border-y border-border">
      <div className="container">
        <div className="flex flex-wrap gap-4 justify-center">
          {exclusions.map((text, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2 text-muted-foreground text-sm"
            >
              <X className="h-4 w-4 text-destructive" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoThisIsNotFor;
