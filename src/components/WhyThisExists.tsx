const purposes = [
  "Strengthen local connection",
  "Reduce online fatigue",
  "Lower the friction of meeting people organically",
  "Help community grow where it actually lives",
];

const WhyThisExists = () => {
  return (
    <section className="py-20 md:py-28 bg-surface/50 border-t border-border">
      <div className="container max-w-xl">
        <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-6 text-center tracking-tight">
          Why This Exists
        </h2>

        <p className="font-serif text-lg md:text-xl text-foreground text-center mb-8 leading-relaxed">
          Gay community has always been built in real places—not feeds.
        </p>

        <div className="w-12 h-px bg-border mx-auto my-8" />

        <p className="text-muted-foreground text-center mb-6">
          ThickTimber exists to:
        </p>

        <ul className="space-y-3 max-w-sm mx-auto">
          {purposes.map((purpose, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
              <span className="text-foreground text-sm md:text-base">
                {purpose}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground text-center mt-10 text-sm md:text-base italic max-w-md mx-auto leading-relaxed">
          Think of it as a quiet layer beneath your city, helping people find each other without forcing interaction.
        </p>
      </div>
    </section>
  );
};

export default WhyThisExists;
