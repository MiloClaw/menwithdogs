const PrivacyTrust = () => {
  return (
    <section className="py-28 md:py-40 bg-surface/30">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            {/* Left: Bold statement */}
            <div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.15] text-balance">
                Your preferences are private.
              </h2>
            </div>

            {/* Right: Privacy explanation as prose */}
            <div className="border-l-4 border-accent pl-8 md:pl-10">
              <p className="text-foreground text-base md:text-lg leading-relaxed mb-6">
                What you save and how you browse shapes only your view — never a public profile. No one sees your list. No one knows where you've been.
              </p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                This is how personalization should work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyTrust;
