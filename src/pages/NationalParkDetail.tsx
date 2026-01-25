import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Ruler, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import NationalParkMap from '@/components/map/NationalParkMap';
import { useNationalPark } from '@/hooks/useNationalPark';
import NotFound from './NotFound';

const NationalParkDetail = () => {
  const { parkId } = useParams<{ parkId: string }>();
  const navigate = useNavigate();
  const { park, relatedParks, isNotFound } = useNationalPark(parkId);

  if (isNotFound || !park) {
    return <NotFound />;
  }

  const formatAcreage = (acreage: number) => {
    if (acreage >= 1000000) {
      return `${(acreage / 1000000).toFixed(1)}M acres`;
    }
    return `${(acreage / 1000).toFixed(0)}K acres`;
  };

  const seoSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": park.name,
    "description": park.description,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": park.lat,
      "longitude": park.lng
    },
    "url": park.npsUrl
  };

  return (
    <PageLayout>
      <SEOHead
        title={`${park.name} - National Parks`}
        description={park.description}
        keywords={`${park.name}, national park, ${park.states.join(', ')}, hiking, camping, outdoor adventure`}
        canonicalPath={`/places/national-parks/${park.id}`}
        schema={seoSchema}
      />

      {/* Hero Map Section */}
      <section className="relative h-[50vh] md:h-[60vh]">
        <NationalParkMap
          lat={park.lat}
          lng={park.lng}
          parkName={park.name}
          parkId={park.id}
          initialZoom={10}
        />

        {/* Back Navigation Overlay */}
        <div className="absolute top-4 left-4 z-10">
        <Button
            variant="secondary"
            size="default"
            onClick={() => navigate('/places/national-parks')}
            className="gap-2 shadow-lg bg-white text-foreground border border-border hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">All Parks</span>
          </Button>
        </div>
      </section>

      {/* Park Content */}
      <section className="container py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          {/* State Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {park.states.map((state) => (
              <Badge key={state} variant="secondary" className="font-mono text-xs">
                {state}
              </Badge>
            ))}
          </div>

          {/* Park Name */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance mb-6">
            {park.name}
          </h1>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-amber" />
              <span>Established <span className="text-foreground font-medium">{park.established}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-brand-green" />
              <span className="text-foreground font-medium">{formatAcreage(park.acreage)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-navy" />
              <span>{park.states.join(', ')}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            {park.description}
          </p>

          {/* External Link */}
          <Button asChild size="lg" className="gap-2">
            <a href={park.npsUrl} target="_blank" rel="noopener noreferrer">
              Visit NPS.gov
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </section>

      {/* Related Parks */}
      {relatedParks.length > 0 && (
        <section className="container pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-8">
              More Parks in {park.states[0]}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedParks.map((relatedPark) => (
                <Link
                  key={relatedPark.id}
                  to={`/places/national-parks/${relatedPark.id}`}
                  className="group flex items-start gap-4 p-4 rounded-lg border border-border bg-card transition-all hover:bg-accent/50 hover:border-accent"
                >
                  <div className="flex-shrink-0 p-2.5 rounded-full bg-brand-green/10 group-hover:bg-brand-green/20 transition-colors">
                    <Mountain className="h-5 w-5 text-brand-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                      {relatedPark.name.replace(' National Park', '')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Est. {relatedPark.established} • {formatAcreage(relatedPark.acreage)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Back CTA */}
      <section className="py-12 md:py-16 bg-accent/30">
        <div className="container text-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/places/national-parks')}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to All National Parks
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default NationalParkDetail;
