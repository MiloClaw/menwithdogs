import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

const Privacy = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Privacy Policy" 
        subtitle="Last Updated: December 2024" 
      />
      
      <div className="container py-8 md:py-12 lg:py-16">
        <div className="max-w-prose">
          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              1. Introduction
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              ThickTimber ("we," "us," or "our") is committed to protecting your privacy. This 
              Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our Service.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              By accessing or using ThickTimber, you agree to the terms of this Privacy Policy. 
              If you do not agree, please do not access or use the Service.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              2. Our Privacy Commitment
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              ThickTimber is designed around intentional privacy. We believe meaningful community 
              is built through trust, not exposure. Our platform prioritizes:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>Minimal data collection—we only collect what is necessary to provide the Service</li>
              <li>No public profiles—your presence on the platform is private by default</li>
              <li>No social metrics—we do not display follower counts, likes, or popularity signals</li>
              <li>No data selling—we never sell your personal information to third parties</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              3. Information We Collect
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Information You Provide:</strong>
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Account information (email address, password)</li>
              <li>Profile information (name, relationship status, location preferences)</li>
              <li>Interests and preferences you select</li>
              <li>Communications you send to us</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Information Collected Automatically:</strong>
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>Device information (device type, operating system, browser type)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>IP address and approximate location</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              4. How We Use Your Information
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>Provide, maintain, and improve the Service</li>
              <li>Personalize your experience and surface relevant local discoveries</li>
              <li>Communicate with you about updates, features, and support</li>
              <li>Enforce our Terms of Service and community guidelines</li>
              <li>Protect against fraud, abuse, and unauthorized access</li>
              <li>Analyze aggregate usage patterns to enhance the platform</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              5. Information We Do Not Collect or Share
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Consistent with our commitment to privacy and the platform's intended purpose:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>We do not collect or request information about your dating or relationship history</li>
              <li>We do not share your profile with other users without your explicit action</li>
              <li>We do not use your data for behavioral advertising or ad targeting</li>
              <li>We do not sell, rent, or trade your personal information</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              6. Information Sharing & Disclosure
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We may share your information only in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li><strong className="text-foreground">With your consent:</strong> When you explicitly authorize sharing</li>
              <li><strong className="text-foreground">Service providers:</strong> Trusted third parties who assist in operating the Service (e.g., hosting, analytics), bound by confidentiality obligations</li>
              <li><strong className="text-foreground">Legal requirements:</strong> When required by law, subpoena, or legal process</li>
              <li><strong className="text-foreground">Safety and protection:</strong> To protect the rights, safety, or property of ThickTimber, our users, or the public</li>
              <li><strong className="text-foreground">Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with continued privacy protections</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              7. Data Security
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your 
              personal information, including:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments</li>
              <li>Access controls limiting data access to authorized personnel</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% 
              secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              8. Data Retention
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We retain your personal information only for as long as necessary to fulfill the 
              purposes for which it was collected, including:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>Providing and improving the Service</li>
              <li>Complying with legal obligations</li>
              <li>Resolving disputes and enforcing agreements</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              9. Your Rights & Choices
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal 
              information:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data</li>
              <li><strong className="text-foreground">Portability:</strong> Request a portable copy of your data</li>
              <li><strong className="text-foreground">Opt-out:</strong> Opt out of certain data processing activities</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              To exercise these rights, please contact us at privacy@thicktimber.com. We will 
              respond to your request within the timeframe required by applicable law.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              10. Cookies & Tracking Technologies
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Maintain your session and preferences</li>
              <li>Understand how you use the Service</li>
              <li>Improve performance and functionality</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              You can control cookie preferences through your browser settings. Note that disabling 
              cookies may affect certain features of the Service.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              11. Third-Party Services
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              The Service may contain links to third-party websites, services, or venues. We are 
              not responsible for the privacy practices of these external sites. We encourage you 
              to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              12. Age Requirement
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              ThickTimber is intended for users 18 years of age and older. We do not knowingly 
              collect personal information from individuals under 18. If we become aware that we 
              have collected data from someone under 18, we will take steps to delete that 
              information promptly.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              13. International Users
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you access the Service from outside the United States, please be aware that your 
              information may be transferred to, stored, and processed in the United States or 
              other countries. By using the Service, you consent to such transfers.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              14. Changes to This Policy
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. If we make material changes, 
              we will notify you by posting the updated policy on this page and updating the 
              "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              15. Contact Us
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please 
              contact us at privacy@thicktimber.com.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Privacy;