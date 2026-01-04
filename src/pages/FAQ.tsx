import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
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
    title: "Community & Inclusion",
    items: [
      {
        question: "Who is this platform for?",
        answer: [
          "This platform is intentionally designed for gay men—both single men and men in committed relationships—who want to form platonic friendships with other gay men.",
          "The experience is built around clear boundaries, shared lived experience, and friendship-only connections. This is not a dating app."
        ]
      },
      {
        question: "Is this a dating or hookup app?",
        answer: [
          "No. Dating, romantic matching, and sexual connections are not part of this platform—by design.",
          "Everyone here joins with the same intention: friendship only."
        ]
      },
      {
        question: "Why is the platform focused specifically on gay men?",
        answer: [
          "We believe meaningful community is built through intentional design.",
          "This platform focuses on gay men because the intake questions, matching logic, safety model, and community norms are designed around that shared experience. A focused scope allows us to create a calmer, clearer, and more respectful experience for everyone involved."
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
          "Yes. Once we have successfully developed and refined this platform, we plan to expand to other communities—each with the same level of care, intention, and purpose-built design.",
          "Rather than creating a one-size-fits-all experience, future expansions will be thoughtfully designed to support real-world connection and community for each group we serve."
        ]
      },
      {
        question: "Can single men and couples both join?",
        answer: [
          "Yes. Both single gay men and gay men in committed relationships are welcome.",
          "Regardless of relationship status, the goal is the same: platonic friendship, clear boundaries, and real-world connection."
        ]
      }
    ]
  }
];

const FAQ = () => {
  return (
    <PageLayout>
      <div className="container max-w-3xl mx-auto px-4 py-16 md:py-24">
        <PageHeader
          title="Frequently Asked Questions"
          subtitle="Answers to common questions about our platform, community, and how it works."
        />

        <div className="mt-12 md:mt-16 space-y-12">
          {faqSections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-xl md:text-2xl font-semibold mb-6 tracking-tight">
                {section.title}
              </h2>
              
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`${section.title}-${index}`}
                    className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/30"
                  >
                    <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:no-underline py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                        {item.answer.map((paragraph, pIndex) => (
                          <p key={pIndex}>{paragraph}</p>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
