const privacyPoints = [
  "Nothing is public by default",
  "No one can see what you've saved",
  "Your browsing history stays private",
  "Your activity shapes your own view only",
];

const PrivacyTrust = () => {
  return (
    <section className="py-28 md:py-40 bg-surface/30">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            {/* Left: Bold statement */}
            <div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.15]">
                Your activity is yours.
              </h2>
              <p className="text-muted-foreground text-lg mt-6 md:mt-8">
                You're in control. Always.
              </p>
            </div>

            {/* Right: Privacy points with accent border */}
            <div className="border-l-4 border-accent pl-8 md:pl-10">
              <ul className="space-y-5 md:space-y-6">
                {privacyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="text-foreground text-base md:text-lg leading-relaxed"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyTrust;
