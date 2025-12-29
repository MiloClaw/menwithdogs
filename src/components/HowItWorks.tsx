import step1Image from "@/assets/step-1-profile.jpg";
import step2Image from "@/assets/step-2-discover.jpg";
import step3Image from "@/assets/step-3-meetup.jpg";

const steps = [
  {
    number: "01",
    image: step1Image,
    title: "Create Your Couple Profile",
    description: "Show up together. Always.",
  },
  {
    number: "02",
    image: step2Image,
    title: "Discover Like-Minded Couples",
    description: "Browse by interests & location.",
  },
  {
    number: "03",
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
        
        <div className="grid md:grid-cols-3 gap-10 md:gap-8 lg:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center opacity-0 animate-fade-in group hover:-translate-y-1 transition-transform duration-200"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <span className="text-sm font-medium text-muted-foreground/50 tracking-wider mb-4">
                {step.number}
              </span>
              <div className="relative w-full max-w-[240px] mb-6">
                <div className="aspect-[9/16] rounded-card overflow-hidden border border-border shadow-md group-hover:shadow-lg transition-shadow duration-200">
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
