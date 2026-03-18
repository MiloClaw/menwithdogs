import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/site-config";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath: string;
  type?: "website" | "article";
  schema?: object;
  ogImage?: string;
}

const SEOHead = ({ 
  title, 
  description, 
  keywords,
  canonicalPath,
  type = "website",
  schema,
  ogImage
}: SEOHeadProps) => {
  const fullTitle = title.includes(SITE_CONFIG.siteName) ? title : `${title} | ${SITE_CONFIG.siteName}`;
  const canonicalUrl = SITE_CONFIG.getCanonicalUrl(canonicalPath);
  const ogImageUrl = SITE_CONFIG.getOgImageUrl(ogImage);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="application-name" content="Men With Dogs – Place-Based Outdoor Directory" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      
      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
