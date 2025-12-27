import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

const Privacy = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Privacy Policy" 
        subtitle="Your privacy matters to us" 
      />
      
      <div className="container py-8 md:py-12 lg:py-16">
        <div className="max-w-prose">
          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Information We Collect
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              update your profile, or communicate with us. This may include your name, email address, 
              location preferences, and interests.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We also automatically collect certain information when you use our service, including 
              your IP address, device type, browser type, and usage patterns.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              How We Use Your Information
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience and recommendations</li>
              <li>Communicate with you about updates and features</li>
              <li>Protect against fraud and unauthorized access</li>
              <li>Analyze usage patterns to enhance the platform</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Information Sharing
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only in the 
              following circumstances:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>With your consent or at your direction</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and the safety of users</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Data Security
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or 
              destruction. However, no method of transmission over the Internet is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Your Rights
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal 
              information, including:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>Access to your personal data</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your data</li>
              <li>Data portability</li>
              <li>Opt-out of certain data processing</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to collect information about your 
              browsing activities. These help us understand how you use our service and enable 
              certain features. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Third-Party Services
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Our service may contain links to third-party websites or services. We are not 
              responsible for the privacy practices of these external sites. We encourage you 
              to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Children's Privacy
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              MainStreetIRL is not intended for users under 18 years of age. We do not knowingly 
              collect personal information from children. If we become aware that we have collected 
              data from a child, we will take steps to delete that information promptly.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Changes to This Policy
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date. 
              We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please 
              contact us at privacy@mainstreetirl.com.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Privacy;
