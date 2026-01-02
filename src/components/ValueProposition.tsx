import { Coffee, Dumbbell, Plane, Wine } from "lucide-react";

const activities = [
  { icon: Coffee, label: "Coffee Dates" },
  { icon: Dumbbell, label: "Local Finds" },
  { icon: Plane, label: "Double Dates" },
  { icon: Wine, label: "New Friends" },
];

const ValueProposition = () => {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-4">
            For couples who want to do more together—with people who get it.
          </h2>
          <div className="w-16 h-px bg-border mx-auto mt-6 mb-4" />
          <p className="text-muted-foreground text-base md:text-lg">
            Discover great places. Meet like-minded couples. Make it happen IRL.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {activities.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 p-4"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-surface rounded-full">
                <Icon className="w-8 h-8 text-primary" strokeWidth={1.75} />
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
