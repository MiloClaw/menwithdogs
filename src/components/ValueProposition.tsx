import { Coffee, Dumbbell, Plane, Wine } from "lucide-react";

const activities = [
  { icon: Coffee, label: "Coffee Dates" },
  { icon: Dumbbell, label: "Local Finds" },
  { icon: Plane, label: "Double Dates" },
  { icon: Wine, label: "New Friends" },
];

const ValueProposition = () => {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-4 tracking-tight text-balance">
            For couples who want to do more together — with people who get it.
          </h2>
          <div className="w-12 h-px bg-border mx-auto my-6" />
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed tracking-wide max-w-md mx-auto">
            Discover great places. Meet like-minded couples. Make it happen IRL.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {activities.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 p-4"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-surface rounded-full">
                <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-[13px] font-medium text-foreground text-center tracking-wide uppercase">
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
