const ValueProposition = () => {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container max-w-xl">
        <div className="text-center">
          <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-6 tracking-tight text-balance">
            A place-based directory that learns what you like.
          </h2>

          <div className="w-12 h-px bg-border mx-auto my-8" />

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
            Browse local spots—cafés, restaurants, parks, gyms, bars. Save the ones that interest you. Over time, the directory adapts to surface more of what fits your taste.
          </p>

          <p className="text-muted-foreground/80 text-sm md:text-base">
            No setup. No profile. Just explore.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
