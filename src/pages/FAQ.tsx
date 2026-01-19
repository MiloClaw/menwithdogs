import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string[];
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: "The Directory",
    items: [
      {
        question: "What is this platform, exactly?",
        answer: [
          "This is a place-centric directory — a curated collection of places and events that resonate with gay men.",
          "It's not a social network. There are no public profiles, no feeds, no messaging. Just real-world places worth visiting."
        ]
      },
      {
        question: "How do I use it?",
        answer: [
          "Browse places in your city, save your favorites, and discover events.",
          "The more you use it, the more relevant it becomes. Your activity shapes what you see — privately."
        ]
      },
      {
        question: "Is this a social network?",
        answer: [
          "No. This platform is intentionally designed without social features.",
          "No profiles to maintain. No feeds to scroll. No DMs to manage. The focus is entirely on places and events — not people."
        ]
      }
    ]
  },
  {
    title: "Personalization & Intelligence",
    items: [
      {
        question: "How does personalization work?",
        answer: [
          "As more gay men use the directory — saving favorites, visiting places — the system learns shared patterns.",
          "These patterns power recommendations that get smarter over time, benefiting everyone."
        ]
      },
      {
        question: "What data do you use?",
        answer: [
          "Your location (to show nearby places), your favorites, and your viewing patterns.",
          "All of this stays private and is never shared."
        ]
      },
      {
        question: "What's the difference between Free and Pro?",
        answer: [
          "Free members get the full directory with recommendations powered by collective patterns.",
          "Pro members can privately add context — interests, hobbies, relationship dynamics — to surface places where their specific patterns overlap with others seeking similar things.",
          "Both paths make the directory smarter. Pro just makes it smarter for you."
        ]
      }
    ]
  },
  {
    title: "Privacy & Trust",
    items: [
      {
        question: "Are my preferences visible to others?",
        answer: [
          "No. Pro preferences are never visible to other users.",
          "They only power the system's intelligence — helping surface better recommendations for you. No profiles. No exposure. Just smarter results."
        ]
      },
      {
        question: "Do you share my data?",
        answer: [
          "No. Your data is never sold, never shared with third parties.",
          "It exists only to improve your experience."
        ]
      },
      {
        question: "Can other users see what I save or visit?",
        answer: [
          "No. Your activity is completely private.",
          "Other users cannot see your favorites, your viewing history, or any of your preferences."
        ]
      }
    ]
  },
  {
    title: "Community & Inclusion",
    items: [
      {
        question: "Who is this platform for?",
        answer: [
          "This platform is intentionally designed for gay men — both single men and men in committed relationships — who want to discover welcoming places and form platonic friendships with other gay men.",
          "The experience is built around clear boundaries, shared lived experience, and friendship-only connections. This is not a dating app."
        ]
      },
      {
        question: "Is this a dating or hookup app?",
        answer: [
          "No. Dating, romantic matching, and sexual connections are not part of this platform — by design.",
          "Everyone here joins with the same intention: friendship only."
        ]
      },
      {
        question: "Why is the platform focused specifically on gay men?",
        answer: [
          "We believe meaningful community is built through intentional design.",
          "This platform focuses on gay men because the intake questions, personalization model, safety approach, and community norms are designed around that shared experience. A focused scope allows us to create a calmer, clearer, and more respectful experience for everyone involved."
        ]
      },
      {
        question: "Is this platform open to the broader LGBTQ+ community?",
        answer: [
          "We respect and affirm people of all gender identities and expressions.",
          "At this stage, this platform is intentionally focused on gay men so we can develop the experience with care, clarity, and consistency. Supporting communities well means not trying to serve everyone at once."
        ]
      },
      {
        question: "Will you expand to other communities in the future?",
        answer: [
          "Yes. Once we have successfully developed and refined this platform, we plan to expand to other communities — each with the same level of care, intention, and purpose-built design.",
          "Rather than creating a one-size-fits-all experience, future expansions will be thoughtfully designed to support real-world connection and community for each group we serve."
        ]
      },
      {
        question: "Can single men and couples both join?",
        answer: [
          "Yes. Both single gay men and gay men in committed relationships are welcome.",
          "Couples can share a profile and discover places together. Regardless of relationship status, the goal is the same: platonic friendship, clear boundaries, and real-world connection."
        ]
      }
    ]
  }
];

const FAQ = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const ghostY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-20 md:py-28 lg:py-36 overflow-hidden"
      >
        {/* Ghost Typography */}
        <motion.div
          style={{ y: ghostY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="text-[20rem] md:text-[28rem] lg:text-[36rem] font-serif text-muted/[0.04] leading-none">
            ?
          </span>
        </motion.div>

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Questions
            </span>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6">
              Frequently Asked Questions
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Answers about the directory, how personalization works, and what makes this different.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="space-y-16 md:space-y-20">
            {faqSections.map((section, sectionIndex) => (
              <motion.div 
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
              >
                <div className="mb-8">
                  <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    {String(sectionIndex + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                    {section.title}
                  </h2>
                </div>
                
                <Accordion type="single" collapsible className="space-y-3">
                  {section.items.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${section.title}-${index}`}
                      className="border border-border rounded-lg px-5 data-[state=open]:bg-muted/30 transition-colors"
                    >
                      <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:no-underline py-5">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5">
                        <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                          {item.answer.map((paragraph, pIndex) => (
                            <p key={pIndex}>{paragraph}</p>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Need More?
            </span>
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-8">
              We're here to help. Reach out and we'll get back to you.
            </p>
            <a 
              href="mailto:hello@mainstreetirl.com" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQ;
