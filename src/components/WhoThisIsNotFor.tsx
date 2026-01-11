const exclusions = [
  { num: "01", text: "No profiles to maintain." },
  { num: "02", text: "No followers to count." },
  { num: "03", text: "No feed to scroll." },
  { num: "04", text: "No likes to chase." },
];

const WhoThisIsNotFor = () => {
  return (
    <section className="py-28 md:py-40 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Ghost symbol */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] md:text-[24rem] font-serif font-bold text-primary-foreground/[0.03] leading-none select-none pointer-events-none">
        ×
      </span>

      <div className="container relative">
        <div className="max-w-4xl mx-auto">
          {/* Bold contrarian statement */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-16 md:mb-20 text-balance">
            Real community doesn't happen in an app.
          </h2>

          {/* Numbered exclusions */}
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8 max-w-2xl mx-auto">
            {exclusions.map((item, i) => (
              <div
                key={i}
                className="flex items-baseline gap-4 text-center sm:text-left justify-center sm:justify-start"
              >
                <span className="text-xs font-medium text-primary-foreground/30 tracking-[0.2em] font-mono">
                  {item.num}
                </span>
                <p className="text-primary-foreground/70 text-lg md:text-xl font-medium">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Closing statement */}
          <p className="text-primary-foreground/90 text-lg md:text-xl text-center mt-12 md:mt-16 max-w-xl mx-auto text-balance">
            Just a smarter way to find where to go — so you can actually be there.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhoThisIsNotFor;
