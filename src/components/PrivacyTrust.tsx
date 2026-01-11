import { Shield } from "lucide-react";

const PrivacyTrust = () => {
  return (
    <section className="py-28 md:py-40 bg-surface/30 relative overflow-hidden">
      {/* Ghost typography */}
      <span className="absolute top-8 right-0 md:top-16 md:right-8 text-[6rem] md:text-[10rem] font-serif font-bold text-muted-foreground/[0.04] leading-none select-none pointer-events-none uppercase">
        Private
      </span>

      <div className="container relative">
        <div className="max-w-5xl mx-auto">
          {/* Mono label with icon */}
          <div className="flex items-center gap-3 mb-10 md:mb-14">
            <span className="text-xs font-medium text-muted-foreground/50 tracking-[0.2em] uppercase">
              Your Data
            </span>
            <Shield className="w-4 h-4 text-accent" />
          </div>

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
