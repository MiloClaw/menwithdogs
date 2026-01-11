const ValueProposition = () => {
  return (
    <section className="py-28 md:py-40 bg-surface/50">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Accent bar */}
          <div className="w-20 h-1 bg-accent mb-10 md:mb-14" />

          {/* Split layout */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left: Display headline */}
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.1] text-balance">
              A curated directory of places worth knowing.
            </h2>

            {/* Right: Supporting text */}
            <div className="space-y-6 md:pt-2">
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                Browse local spots—cafés, restaurants, parks, gyms, bars. Save the ones that interest you. The places you save shape what you see first.
              </p>

              <p className="text-muted-foreground/70 text-base md:text-lg">
                No setup. No profile. Just explore.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
