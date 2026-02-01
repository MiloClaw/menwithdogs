import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import SEOHead from "@/components/SEOHead";

const sitemapSections = [
  {
    title: "Main",
    links: [
      { label: "Home", path: "/" },
      { label: "Places Directory", path: "/places" },
      { label: "Explore Cities", path: "/places/explore" },
      { label: "National Parks", path: "/places/national-parks" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In / Sign Up", path: "/auth" },
      { label: "Settings", path: "/settings" },
      { label: "Preferences", path: "/preferences" },
      { label: "Saved Places", path: "/saved" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Gay Community", path: "/community" },
      { label: "Outdoors", path: "/outdoors" },
      { label: "Find Friends", path: "/find-friends" },
      { label: "Discover Together", path: "/together" },
      { label: "Ambassadors", path: "/ambassadors" },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Blog", path: "/blog" },
      { label: "Contribute", path: "/contribute" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "FAQ", path: "/faq" },
      { label: "Pricing", path: "/pricing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", path: "/terms" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Sitemap", path: "/sitemap" },
    ],
  },
];

const Sitemap = () => {
  const linkClasses =
    "text-foreground/80 hover:text-primary transition-colors underline-offset-4 hover:underline";

  return (
    <PageLayout>
      <SEOHead
        title="Sitemap"
        description="Navigate all pages on ThickTimber - the outdoor places directory for gay men."
        canonicalPath="/sitemap"
      />
      <PageHeader
        title="Sitemap"
        subtitle="All pages on ThickTimber"
      />

      <div className="container py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {sitemapSections.map((section) => (
            <div key={section.title}>
              <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
                {section.title}
              </h2>
              <nav className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={linkClasses}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Sitemap;
