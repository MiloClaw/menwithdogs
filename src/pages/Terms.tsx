import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

const Terms = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Terms of Service" 
        subtitle="Last Updated: December 2024" 
      />
      
      <div className="container py-8 md:py-12 lg:py-16">
        <div className="max-w-prose">
          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              By accessing or using MainStreetIRL (the "Service"), you agree to be bound by these 
              Terms of Service ("Terms"). If you do not agree to these Terms, please do not access 
              or use the Service.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              These Terms apply to all visitors, users, and others who access or use the Service. 
              We reserve the right to update or modify these Terms at any time. Your continued use 
              of the Service following any changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              2. Intended Use & Eligibility
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              MainStreetIRL is an intentionally designed social platform for gay men, including 
              both single men and men in committed relationships, who are seeking platonic 
              friendships with other gay men.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The Service is not intended for dating, romantic relationships, or sexual connections, 
              and use of the Service for such purposes falls outside its intended scope.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              By creating an account or using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>You are at least 18 years of age</li>
              <li>Your use of the Service aligns with its intended purpose, community scope, and 
                boundaries as described in these Terms, the website, onboarding materials, FAQs, 
                and any applicable community guidelines</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              3. Community Scope & Platform Focus
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The Service is intentionally designed around a specific community and use case in 
              order to provide a clear, respectful, and consistent experience.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              While MainStreetIRL respects and affirms people of all gender identities and 
              expressions, participation in the Service is limited to users whose use aligns 
              with the platform's defined community scope and intended purpose.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              The Service is not a general-purpose social network and does not guarantee 
              suitability or access for all individuals or communities.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              4. Incorporation by Reference
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Descriptions of the Service's purpose, intended users, boundaries, and community 
              guidelines provided on the website, during onboarding, or in FAQs are incorporated 
              by reference into these Terms and form part of the agreement between you and 
              MainStreetIRL.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              5. Use of the Service
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              MainStreetIRL is designed to help users discover local experiences and foster 
              real-world, friendship-based community connections. The Service is intended for 
              personal, non-commercial use only.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              You agree to use the Service in a manner consistent with these Terms and all 
              applicable laws and regulations.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              6. User Conduct
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Harass, abuse, intimidate, or harm another person</li>
              <li>Impersonate any person or entity</li>
              <li>Misrepresent your intent for using the Service</li>
              <li>Seek dating, romantic, or sexual relationships</li>
              <li>Transmit malicious code, malware, or harmful content</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Collect or harvest user data without consent</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Failure to comply with these standards may result in restricted access or 
              account termination.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              7. Scope Enforcement & Access Control
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              To maintain the integrity, safety, and purpose of the Service, MainStreetIRL 
              reserves the right, at its sole discretion, to limit, suspend, or terminate 
              access to the Service if an account or usage is determined to fall outside 
              the platform's intended use or community scope.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Decisions regarding access are made solely to preserve the platform's purpose 
              and do not constitute a judgment of any individual's identity, expression, or 
              personal characteristics.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              8. No Guaranteed Access
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Access to the Service is provided at MainStreetIRL's discretion and is not 
              guaranteed. We may modify, restrict, suspend, or discontinue access to the 
              Service at any time to support platform integrity, safety, or alignment with 
              its intended purpose.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              9. Intellectual Property
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by 
              MainStreetIRL and are protected by international copyright, trademark, patent, 
              trade secret, and other intellectual property laws.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works of, publicly 
              display, or otherwise use any content from the Service without prior written consent.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              10. Disclaimers
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The Service is provided on an "as is" and "as available" basis. MainStreetIRL 
              makes no warranties, express or implied, regarding reliability, availability, 
              or suitability for any particular purpose.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We do not guarantee the accuracy, completeness, or usefulness of information 
              provided through the Service, including venue details, reviews, or recommendations.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              11. Limitation of Liability
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, MainStreetIRL, its directors, employees, 
              partners, and affiliates shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including loss of profits, data, use, goodwill, 
              or other intangible losses, resulting from access to or use of the Service.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              12. Future Development
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              References to potential future features, communities, or expansions are aspirational 
              only and do not create any obligation to provide access, functionality, or inclusion 
              beyond the Service's current scope.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision 
              is material, we will provide at least 30 days' notice prior to any new terms taking 
              effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              14. Contact Us
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at 
              support@mainstreetirl.com.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
