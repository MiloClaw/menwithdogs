const exclusions = [
  "Not a social network",
  "Not a dating app",
  "Not a feed",
  "No profiles, no followers, no likes",
];

const WhoThisIsNotFor = () => {
  return (
    <section className="py-28 md:py-40 bg-primary text-primary-foreground">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Bold contrarian statement */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-16 md:mb-20">
            We don't do social.
          </h2>

          {/* Large, spaced exclusions */}
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8 max-w-2xl mx-auto">
            {exclusions.map((text, i) => (
              <p
                key={i}
                className="text-primary-foreground/70 text-lg md:text-xl font-medium text-center sm:text-left"
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoThisIsNotFor;
