import { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ExternalLink, ArrowLeft, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTagPage, usePlacesWithTag } from '@/hooks/useTagPage';

// Hero images for specific tags
import clothingOptionalHero from '@/assets/tag-clothing-optional-hero.png';

const TAG_HERO_IMAGES: Record<string, string> = {
  clothing_optional: clothingOptionalHero,
};

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: tagPage, isLoading, error } = useTagPage(slug);
  const { data: places } = usePlacesWithTag(slug);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const heroImage = slug ? TAG_HERO_IMAGES[slug] : undefined;

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container max-w-3xl py-12 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (error || !tagPage) {
    return (
      <PageLayout>
        <SEOHead 
          title="Tag Not Found - ThickTimber"
          description="This tag page could not be found."
          canonicalPath={`/tags/${slug || ''}`}
        />
        <div className="container max-w-3xl py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Tag Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This tag doesn't have a dedicated page yet.
          </p>
          <Button asChild variant="outline">
            <Link to="/places">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Places
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEOHead 
        title={tagPage.seo_title || `${tagPage.title} - ThickTimber`}
        description={tagPage.seo_description || tagPage.subtitle || `Learn about the ${tagPage.title} tag on ThickTimber.`}
        canonicalPath={`/tags/${slug}`}
      />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative h-[400px] md:h-[500px] overflow-hidden"
      >
        {heroImage ? (
          <motion.img 
            src={heroImage}
            alt={`${tagPage.title} - outdoor setting`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ y: imageY }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/80" />
        
        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-4">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-medium tracking-[0.2em] uppercase text-white/80 mb-4"
          >
            Community Tag
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-white text-center max-w-3xl"
          >
            {tagPage.title}
          </motion.h1>
          
          {tagPage.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-lg md:text-xl text-white/90 text-center max-w-xl"
            >
              {tagPage.subtitle}
            </motion.p>
          )}
        </div>
      </section>

      {/* Section 01 — Understanding (Markdown Body) */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Ghost parallax number */}
        <motion.span
          style={{ y: ghostY }}
          className="pointer-events-none select-none absolute -left-8 top-12 text-[25vw] md:text-[20vw] font-serif text-primary/[0.03] leading-none"
          aria-hidden
        >
          01
        </motion.span>

        <div className="container max-w-3xl relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-4"
          >
            01 — Understanding
          </motion.span>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="prose prose-lg prose-neutral dark:prose-invert max-w-none [&_h2]:font-serif [&_h3]:font-serif"
          >
            <ReactMarkdown>{tagPage.body_markdown}</ReactMarkdown>
          </motion.article>
        </div>
      </section>

      {/* Section 02 — Community Guidelines */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm font-medium tracking-widest uppercase text-primary-foreground/70 mb-4"
          >
            02 — Community Guidelines
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl mb-8"
          >
            Respect, Consent, Discretion
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 text-primary-foreground/90"
          >
            <p className="text-lg">
              Places with this tag are shared for informational purposes. Our community upholds these standards:
            </p>
            <ul className="space-y-3 text-lg">
              <li className="flex items-start gap-3">
                <span className="text-primary-foreground/60 font-serif">•</span>
                <span>Respect local laws and posted regulations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-foreground/60 font-serif">•</span>
                <span>Practice enthusiastic consent in all interactions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-foreground/60 font-serif">•</span>
                <span>Leave no trace — preserve these spaces for others</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-foreground/60 font-serif">•</span>
                <span>Be mindful of mixed-use areas and families</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Section 03 — Places with this Tag */}
      {places && places.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-4"
            >
              03 — Discover
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-foreground mb-8"
            >
              Places tagged "{tagPage.canonical_tags.label}"
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {places.map((place: any, index: number) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link 
                    to={`/love/${place.id}`}
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-muted relative">
                        {place.stored_photo_urls?.[0] ? (
                          <img 
                            src={place.stored_photo_urls[0]} 
                            alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <p className="font-serif text-lg font-medium group-hover:text-primary transition-colors line-clamp-1">
                          {place.name}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {[place.city, place.state].filter(Boolean).join(', ')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {tagPage.external_link_url && (
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container max-w-2xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary-foreground/70 mb-4"
            >
              Connect
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl mb-6"
            >
              Looking for more?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto"
            >
              For members who want to connect with others who share this interest, 
              we have a dedicated community space.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button asChild size="lg" variant="secondary" className="text-base">
                <a 
                  href={tagPage.external_link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {tagPage.external_link_label || 'Join the Community'}
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Back link footer */}
      <section className="py-12">
        <div className="container text-center">
          <Link 
            to="/places" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Places
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default TagPage;
