import { Coffee, Dumbbell, Plane, Wine } from "lucide-react";

const activities = [
  { icon: Coffee, label: "Morning Coffee" },
  { icon: Dumbbell, label: "Gym Sessions" },
  { icon: Plane, label: "Weekend Trips" },
  { icon: Wine, label: "Game Nights" },
];

const ValueProposition = () => {
  return (
    <section className="py-16 md:py-24 bg-background border-t border-border">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-4">
            Built for couples who already have their relationship dialed in.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Expand your social circle with couples who share your vibe.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {activities.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 p-4"
            >
              <div className="w-16 h-16 flex items-center justify-center">
                <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-foreground text-center">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
