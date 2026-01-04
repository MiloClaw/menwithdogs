import { MapPin, Calendar, BarChart3, Shield } from "lucide-react";

const features = [
  { icon: MapPin, label: "Curated Places" },
  { icon: Calendar, label: "Local Events" },
  { icon: BarChart3, label: "Aggregate Signals" },
  { icon: Shield, label: "Privacy First" },
];

const ValueProposition = () => {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-4 tracking-tight text-balance">
            Discover where community is already forming.
          </h2>
          <div className="w-12 h-px bg-border mx-auto my-6" />
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed tracking-wide max-w-md mx-auto">
            Browse curated places. See aggregate activity. Connect on your terms.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {features.map(({ icon: Icon, label }) => (
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
