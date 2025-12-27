import step1Image from "@/assets/step-1-profile.jpg";
import step2Image from "@/assets/step-2-discover.jpg";
import step3Image from "@/assets/step-3-meetup.jpg";

const steps = [
  {
    image: step1Image,
    title: "Create Your Couple Profile",
    description: "Show up together. Always.",
  },
  {
    image: step2Image,
    title: "Discover Like-Minded Couples",
    description: "Browse by interests & location.",
  },
  {
    image: step3Image,
    title: "Meet Up In Real Life",
    description: "Suggest a casual meet-up.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-surface">
      <div className="container">
        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground text-center mb-12 md:mb-16">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative w-full max-w-[240px] mb-6">
                <div className="aspect-[9/16] rounded-card overflow-hidden border border-border shadow-sm">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
