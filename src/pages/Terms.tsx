import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

const Terms = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Terms of Service" 
        subtitle="Last updated: December 2024" 
      />
      
      <div className="container py-8 md:py-12 lg:py-16">
        <div className="max-w-prose">
          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              By accessing or using MainStreetIRL, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              These terms apply to all visitors, users, and others who access or use the service. 
              We reserve the right to update these terms at any time, and your continued use of the 
              service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Use of Service
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              MainStreetIRL is a platform designed to help couples discover local experiences and 
              connect with their communities. Our service is intended for personal, non-commercial use.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              You must be at least 18 years of age to use this service. By using MainStreetIRL, 
              you represent and warrant that you meet this age requirement.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              User Conduct
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              You agree to use MainStreetIRL in a manner consistent with all applicable laws and 
              regulations. You will not use the service to:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>Harass, abuse, or harm another person</li>
              <li>Impersonate any person or entity</li>
              <li>Transmit any harmful code or malware</li>
              <li>Interfere with or disrupt the service</li>
              <li>Collect user information without consent</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Intellectual Property
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The service and its original content, features, and functionality are owned by 
              MainStreetIRL and are protected by international copyright, trademark, patent, 
              trade secret, and other intellectual property laws.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works of, publicly 
              display, or otherwise use any content from our service without prior written consent.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Disclaimers
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The service is provided on an "as is" and "as available" basis. MainStreetIRL makes 
              no warranties, expressed or implied, regarding the service's reliability, availability, 
              or suitability for any particular purpose.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We do not guarantee the accuracy, completeness, or usefulness of any information 
              provided through the service, including venue details, reviews, or recommendations.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Limitation of Liability
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              In no event shall MainStreetIRL, its directors, employees, partners, or affiliates 
              be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses, resulting from your access to or use of the service.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Changes to Terms
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these terms at any time. If a revision is 
              material, we will provide at least 30 days' notice prior to any new terms taking 
              effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at 
              hello@mainstreetirl.com.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
