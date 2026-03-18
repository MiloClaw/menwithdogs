import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
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
        question: "What is Men With Dogs, exactly?",
        answer: [
          "Men With Dogs is a place-based directory designed to help men connect more organically through shared interests, outdoor activities, and the real places where their community gathers.",
          "Instead of centering interaction around profiles or feeds, the directory highlights trails, campsites, beaches, and outdoor spaces based on where people actually go and return to over time."
        ]
      },
      {
        question: "How do I use the directory?",
        answer: [
          "You browse outdoor places in your area, save the ones you enjoy, and optionally contribute new places you think others would appreciate.",
          "As you use the directory, recommendations quietly refine—based on shared patterns across the community and, if you choose PRO, your private preferences."
        ]
      },
      {
        question: "Is this a social network or dating app?",
        answer: [
          "No. Men With Dogs is designed as a real-world discovery tool.",
          "While it can support connection by helping you understand where your community gathers, it doesn't revolve around browsing people, feeds, or public profiles. Interaction is optional and centered around places, not performance."
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
          "The free directory reflects community-level patterns—highlighting places people tend to enjoy and return to.",
          "If you subscribe to PRO, you can add more context privately, such as outdoor interests, activity preferences, or routines. This helps the directory surface places that align more closely with how you like to spend your time."
        ]
      },
      {
        question: "What data does the system use?",
        answer: [
          "The system uses: places saved or contributed, general usage patterns at the community level, and optional preferences you choose to add privately (PRO).",
          "It does not use public profiles, social graphs, or advertising data."
        ]
      },
      {
        question: "What's the difference between Free and PRO?",
        answer: [
          "Free gives you full access to the directory, powered by shared community behavior.",
          "PRO adds private tuning—helping the directory understand your specific interests more precisely so recommendations align more closely with you.",
          "Both contribute to making the directory better. PRO simply makes it more precise for the individual."
        ]
      }
    ]
  },
  {
    title: "Privacy & Trust",
    items: [
      {
        question: "Are my preferences visible to other users?",
        answer: [
          "No. Your saved places and preferences are never visible to others.",
          "Even when using PRO, your information is used only to refine recommendations for you. There are no public profiles or exposed activity."
        ]
      },
      {
        question: "Do you sell or share my data?",
        answer: [
          "No. Men With Dogs does not sell user data, share it with ad networks, or use it for targeted advertising.",
          "The platform is designed to operate without social metrics or surveillance-based incentives."
        ]
      },
      {
        question: "Can other users see where I go or what I save?",
        answer: [
          "No. The directory reflects shared patterns at a high level, not individual behavior.",
          "Your activity remains private."
        ]
      }
    ]
  },
  {
    title: "Community & Inclusion",
    items: [
      {
        question: "Who is Men With Dogs designed for?",
        answer: [
          "Men With Dogs is currently designed specifically for gay men who enjoy outdoor and active lifestyles.",
          "This focus allows the directory, language, and intelligence to reflect the needs, experiences, and cultural context of that community."
        ]
      },
      {
        question: "Is this platform open to single men, couples, or friends?",
        answer: [
          "Yes. Single men, couples, and friends all use the directory in different ways—whether exploring individually or planning experiences together.",
          "The platform is designed around places, not relationship status."
        ]
      },
      {
        question: "Is this a hookup or dating platform?",
        answer: [
          "No. Men With Dogs doesn't facilitate dating or sexual interaction.",
          "It's built to support real-world discovery and organic connection through shared interests and places. What happens offline is always up to the individuals involved."
        ]
      },
      {
        question: "Why focus specifically on gay men?",
        answer: [
          "Community forms differently across cultures and identities.",
          "By focusing on gay men, Men With Dogs can be intentional about language, privacy expectations, safety, and the types of places highlighted—rather than trying to be everything to everyone.",
          "This focus allows the platform to work better for the people it's designed for."
        ]
      },
      {
        question: "Will you expand to other communities in the future?",
        answer: [
          "Possibly.",
          "If Men With Dogs expands, it will do so intentionally—designing each version around the specific needs, values, and contexts of that community, rather than applying a one-size-fits-all approach."
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

  // Generate FAQ schema from sections
  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqSections.flatMap(section => 
      section.items.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer.join(" ")
        }
      }))
    )
  }), []);

  return (
    <PageLayout>
      <SEOHead
        title="Frequently Asked Questions | Men With Dogs Directory"
        description="Answers about how the directory works, personalization, privacy, and what makes Men With Dogs different from social or profile-based platforms."
        keywords="FAQ, questions, directory help, personalization, privacy"
        canonicalPath="/faq"
        schema={faqSchema}
      />
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
              We're happy to help. Reach out anytime.
            </p>
            <a 
              href="mailto:hello@menwithdogs.com" 
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
