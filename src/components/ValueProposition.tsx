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
              Find places where you'll actually want to spend time.
            </h2>

            {/* Right: Supporting text */}
            <div className="space-y-6 md:pt-2">
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                A personalized directory of local spots — cafés, restaurants, parks, gyms, bars — surfaced based on what matters to you. The more you explore, the more relevant your view becomes.
              </p>

              <p className="text-muted-foreground/70 text-base md:text-lg">
                Better places. Better chances of running into your people.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
