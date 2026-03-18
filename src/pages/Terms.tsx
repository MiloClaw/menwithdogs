import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

const Terms = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Terms of Service" 
        subtitle="Last Updated: January 2026" 
      />
      
      <div className="container py-8 md:py-12 lg:py-16">
        <div className="max-w-prose">
          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              By accessing or using Men With Dogs (the "Service"), you agree to be bound by these 
              Terms of Service ("Terms"). If you do not agree to these Terms, please do not access 
              or use the Service.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We reserve the right to update or modify these Terms at any time. Your continued use 
              of the Service following any changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              2. Nature of the Platform
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Men With Dogs is a place-based discovery platform that provides information and 
              tools to help users explore real-world locations and experiences. The platform 
              is designed specifically for gay men who enjoy outdoor and active lifestyles.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Men With Dogs does not:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Arrange, organize, or facilitate meetings between users</li>
              <li>Verify the identity, intent, background, or conduct of users</li>
              <li>Supervise, monitor, or participate in offline interactions</li>
              <li>Guarantee any outcomes, connections, or experiences</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Any interaction between users—online or offline—is entirely voluntary and 
              occurs at the users' sole discretion. Men With Dogs is not responsible for 
              the conduct of any user, whether on or off the platform.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              3. Eligibility
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              By using Men With Dogs, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>Your use complies with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              4. User Responsibility & Assumption of Risk
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              You are solely responsible for your interactions with other users and for 
              any activities you choose to undertake based on information provided through 
              the platform.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Engaging in outdoor activities, travel, or meeting others in real-world 
                settings involves inherent risks, including personal injury, property 
                damage, or other harm</li>
              <li>You are responsible for evaluating the safety and suitability of any 
                location, activity, or interaction</li>
              <li>Men With Dogs does not screen, verify, or guarantee the safety of any 
                place, event, or user</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              By using Men With Dogs, you voluntarily assume all such risks.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              5. User Conduct
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Harass, threaten, stalk, or intimidate others</li>
              <li>Post illegal, non-consensual, or exploitative content</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in fraud, spam, or deceptive practices</li>
              <li>Transmit malicious code, malware, or harmful content</li>
              <li>Scrape, harvest, or collect user data without authorization</li>
              <li>Attempt to identify, expose, or compromise other users' private activity</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Failure to comply may result in restricted access or account termination.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              6. 18+ Content and Community Areas
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Certain areas of the platform may be designated for users aged 18 and older 
              and may include mature discussions or user-generated content.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Men With Dogs does not create, endorse, moderate in real-time, or verify 
              user-submitted content and is not responsible for interactions that occur 
              within or outside these areas.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We reserve the right to remove content that violates these Terms or 
              applicable law.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              7. No Professional Advice
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Information provided on Men With Dogs—including place descriptions, trail 
              conditions, event details, and user contributions—is for general 
              informational purposes only.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              This information should not be relied upon as professional, safety, medical, 
              legal, or travel advice. Users are responsible for independently evaluating 
              conditions, risks, accessibility, and suitability of any location or activity.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              8. Privacy
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Your use of the Service is subject to our Privacy Policy, which describes 
              how we collect, use, and protect your information. By using Men With Dogs, 
              you consent to the practices described in the Privacy Policy.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              9. User-Generated Content
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              You retain ownership of content you submit to Men With Dogs. By submitting 
              content, you grant Men With Dogs a non-exclusive, royalty-free, worldwide 
              license to use, display, and distribute that content in connection with 
              the Service.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              You represent that you have the right to submit any content you provide 
              and that such content does not violate any third-party rights.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Men With Dogs does not guarantee the accuracy of user-generated content and 
              is not liable for content submitted by users.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              10. Intellectual Property
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by 
              Men With Dogs and are protected by international copyright, trademark, patent, 
              trade secret, and other intellectual property laws.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works of, publicly 
              display, or otherwise use any content from the Service without prior written consent.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              11. Disclaimers
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 uppercase font-medium">
              The Service is provided on an "as is" and "as available" basis without 
              warranties of any kind, whether express, implied, or statutory.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Men With Dogs expressly disclaims all warranties, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Accuracy, reliability, or completeness of any information</li>
              <li>Uninterrupted, secure, or error-free operation</li>
              <li>Suitability, safety, or legality of any place, event, or activity</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We do not warrant that the Service will meet your requirements or that 
              any information provided will be accurate or current.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              12. Limitation of Liability
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 uppercase font-medium">
              To the fullest extent permitted by law, Men With Dogs, its directors, 
              employees, partners, and affiliates shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
              <li>Any damages arising from your use of or inability to use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any unauthorized access to or use of our servers or your information</li>
              <li>Any personal injury or property damage resulting from your use of the 
                Service or any offline interactions</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              In no event shall Men With Dogs's total liability exceed the amount you have 
              paid to Men With Dogs in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              13. Indemnification
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless Men With Dogs and its 
              officers, directors, employees, and agents from any claims, damages, 
              losses, liabilities, costs, or expenses (including reasonable attorneys' 
              fees) arising from:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Any content you submit to the Service</li>
              <li>Any offline interactions or activities undertaken in connection with 
                your use of the Service</li>
            </ul>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              14. Platform Rights
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Men With Dogs reserves the right, at its sole discretion, to:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
              <li>Modify, suspend, or discontinue the Service at any time</li>
              <li>Limit, suspend, or terminate any user's access</li>
              <li>Remove any content that violates these Terms</li>
              <li>Refuse service to anyone for any reason</li>
            </ul>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              These actions do not require prior notice and do not constitute a judgment 
              of any individual's identity or personal characteristics.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              15. Changes to Terms
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision 
              is material, we will provide at least 30 days' notice prior to any new terms taking 
              effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section className="mb-8 md:mb-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              16. Governing Law
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws 
              of the State of Texas, without regard to its conflict of law provisions.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Any disputes arising under these Terms shall be resolved in the state or 
              federal courts located in Texas, and you consent to the personal 
              jurisdiction of such courts.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
              17. Contact Us
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:support@menwithdogs.com" className="text-primary hover:underline">
                support@menwithdogs.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
