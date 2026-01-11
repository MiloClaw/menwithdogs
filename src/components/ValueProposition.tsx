const ValueProposition = () => {
  return (
    <section className="py-28 md:py-40 bg-surface/50 relative overflow-hidden">
      <div className="container">
        <div className="max-w-5xl mx-auto relative">
          {/* Ghost number */}
          <span className="absolute -top-16 -left-8 md:-top-20 md:-left-12 text-[10rem] md:text-[14rem] font-serif font-bold text-muted-foreground/[0.04] leading-none select-none pointer-events-none">
            01
          </span>

          {/* Mono label */}
          <span className="text-xs font-medium text-muted-foreground/50 tracking-[0.2em] uppercase mb-8 block">
            What This Is
          </span>

          {/* Split layout */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left: Display headline */}
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.1] text-balance">
              Find places where you'll actually want to spend time.
            </h2>

            {/* Right: Supporting text */}
            <div className="space-y-6 md:pt-2 max-w-prose">
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                A personalized directory of local spots — cafés, restaurants, parks, gyms, bars — surfaced based on what matters to you. Save what catches your eye, and similar spots rise to the top.
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
