import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath: string;
  type?: "website" | "article";
  schema?: object;
}

const SEOHead = ({ 
  title, 
  description, 
  keywords,
  canonicalPath,
  type = "website",
  schema
}: SEOHeadProps) => {
  const fullTitle = title.includes("ThickTimber") ? title : `${title} | ThickTimber`;
  const canonicalUrl = `https://thicktimber.lovable.app${canonicalPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
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
