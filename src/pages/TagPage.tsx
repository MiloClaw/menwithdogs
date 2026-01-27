import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowLeft, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTagPage, usePlacesWithTag } from '@/hooks/useTagPage';

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: tagPage, isLoading, error } = useTagPage(slug);
  const { data: places } = usePlacesWithTag(slug);

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
      
      <div className="container max-w-3xl py-8 md:py-12">
        {/* Back link */}
        <Link 
          to="/places" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Places
        </Link>

        {/* Hero Section */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {tagPage.title}
          </h1>
          {tagPage.subtitle && (
            <p className="text-lg text-muted-foreground">
              {tagPage.subtitle}
            </p>
          )}
        </header>

        {/* Body Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none mb-10">
          <ReactMarkdown>{tagPage.body_markdown}</ReactMarkdown>
        </article>

        {/* External Link CTA */}
        {tagPage.external_link_url && (
          <Card className="mb-10 bg-accent/50 border-accent">
            <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {tagPage.external_link_label || 'Learn More'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Connect with the community in our dedicated space.
                </p>
              </div>
              <Button asChild>
                <a 
                  href={tagPage.external_link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {tagPage.external_link_label || 'Visit'}
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Places with this tag */}
        {places && places.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Places tagged "{tagPage.canonical_tags.label}"
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {places.map((place: any) => (
                <Link 
                  key={place.id} 
                  to={`/love/${place.id}`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      {place.stored_photo_urls?.[0] ? (
                        <img 
                          src={place.stored_photo_urls[0]} 
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                        {place.name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {[place.city, place.state].filter(Boolean).join(', ')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
};

export default TagPage;
