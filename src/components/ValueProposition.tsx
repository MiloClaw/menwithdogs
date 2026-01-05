import { CheckCircle } from "lucide-react";
const whoThisIsFor = ["Are tired of doom-scrolling and shallow interactions", "Want meaningful, platonic connection and community", "Prefer real conversations over endless DMs", "Value privacy, boundaries, and intention", "Want to feel connected without being \"on an app all the time\""];
const ValueProposition = () => {
  return <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container max-w-2xl">
        {/* Sub-Hero Value Statement */}
        <div className="text-center mb-16 md:mb-20">
          <p className="font-serif text-xl md:text-2xl text-foreground font-medium leading-relaxed mb-6">
            Most apps keep you online.<br />
            We're built to help you show up—in the real world, on your terms.
          </p>
          <div className="w-12 h-px bg-border mx-auto my-8" />
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Instead of swiping through strangers, we help you discover the places where your community already gathers, and gently surface moments where saying hello actually makes sense.
          </p>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mt-6">No pressure.
No algorithms chasing engagement.
          <br />
            No algorithms chasing engagement.<br />
            No personal exposure unless you choose it.
          </p>
        </div>

        {/* Who This Is For */}
        <div className="bg-surface rounded-lg p-8 md:p-10">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-6 text-center tracking-tight">
            Who This Is For
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            This app is for gay men who:
          </p>
          <ul className="space-y-4 max-w-md mx-auto">
            {whoThisIsFor.map((item, index) => <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground text-sm md:text-base leading-relaxed">
                  {item}
                </span>
              </li>)}
          </ul>
          <p className="text-muted-foreground text-center mt-8 text-sm md:text-base">
            Single or partnered. Introvert or social. New to a city or deeply rooted.
          </p>
        </div>
      </div>
    </section>;
};
export default ValueProposition;