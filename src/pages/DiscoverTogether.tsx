import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import { SessionGenerator } from '@/components/discover/SessionGenerator';
import { SessionJoin } from '@/components/discover/SessionJoin';
import { OverlapResults } from '@/components/discover/OverlapResults';
import { useOverlapSession } from '@/hooks/useOverlapSession';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, ArrowLeft, Shield, Clock, Eye, Mountain, Tent, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DiscoverTogether() {
  const { token: urlToken } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const {
    activeSession,
    pendingSession,
    isWaitingForPartner,
    hasActiveSession,
    isLoading,
    isCreating,
    isJoining,
    isEnding,
    createSession,
    joinSession,
    endSession,
    cancelPending,
  } = useOverlapSession();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Auto-join if URL has token and user is authenticated
  useEffect(() => {
    if (urlToken && isAuthenticated && !isLoading && !hasActiveSession && !isWaitingForPartner) {
      joinSession(urlToken);
    }
  }, [urlToken, isAuthenticated, isLoading, hasActiveSession, isWaitingForPartner, joinSession]);

  // Show loading while checking auth
  if (authLoading || isLoading) {
    return (
      <PageLayout>
        <SEOHead
          title="Discover Outdoor Places Together"
          description="Find outdoor places that work for two people—privately. A place-first tool for planning hikes, trips, and shared experiences without sharing preferences."
          keywords="couples hiking, outdoor planning, shared discovery, private recommendations, trip planning"
          canonicalPath="/together"
        />
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  // Show marketing content + auth prompt if not logged in
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <SEOHead
          title="Discover Outdoor Places Together"
          description="Find outdoor places that work for two people—privately. A place-first tool for planning hikes, trips, and shared experiences without sharing preferences."
          keywords="couples hiking, outdoor planning, shared discovery, private recommendations, trip planning"
          canonicalPath="/together"
        />

        {/* Hero Section */}
        <section ref={heroRef} className="relative py-20 md:py-28 lg:py-36 overflow-hidden">
          <motion.div
            style={{ y: ghostY }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          >
            <span className="text-[16rem] md:text-[22rem] lg:text-[28rem] font-serif text-muted/[0.04] leading-none">
              ⊕
            </span>
          </motion.div>

          <div className="container max-w-4xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Discover Together
              </span>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 text-balance">
                Find Outdoor Places That Work for Both of You
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
                Without sharing preferences. Without linking accounts. Just clearer outdoor recommendations—privately.
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-3xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="mb-8">
                <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  01
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">How It Works</h2>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Start a private session", description: "One of you generates a temporary session code." },
                  { title: "Join securely", description: "The other person enters the code—no account linking required." },
                  { title: "Explore shared fit", description: "The directory highlights outdoor places that align with both of your interests—without revealing individual preferences." },
                  { title: "Session expires automatically", description: "Sessions close after 24 hours. Nothing is stored or merged." },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-lg text-muted-foreground pt-1">
                      <span className="font-medium text-foreground">{step.title}</span> — {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Privacy Promise Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container max-w-3xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="mb-8">
                <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-primary-foreground/70 mb-3">
                  Designed for privacy
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                  What Makes This Different
                </h2>
              </div>

              <div className="grid gap-6">
                {[
                  {
                    title: "Your individual preferences stay private",
                    description: "No shared lists or exposed activity between users.",
                  },
                  {
                    title: "Works for any pair",
                    description: "Partners, friends, or travel companions—anyone exploring together.",
                  },
                  {
                    title: "Place-first, not people-first",
                    description: "The directory surfaces outdoor spots that work for both.",
                  },
                  {
                    title: "Temporary by design",
                    description: "Sessions expire. No permanent connection.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border-l-2 border-primary-foreground/30 pl-5"
                  >
                    <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                    <p className="text-primary-foreground/80">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-12 text-center">
                <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Works well for
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">Perfect For</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: Heart,
                    title: "Couples planning a hiking or camping trip",
                    description: "Find trails and campsites you'll both enjoy.",
                  },
                  {
                    icon: Mountain,
                    title: "Outdoor buddies exploring a new area",
                    description: "Quickly find spots that work for both of you.",
                  },
                  {
                    icon: Users,
                    title: "Friends coordinating a weekend adventure",
                    description: "Discover places that work for the whole group.",
                  },
                  {
                    icon: Tent,
                    title: "Travel companions mapping stops along the way",
                    description: "Build a shared list of outdoor stops along the way.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-6 bg-card border border-border rounded-lg"
                  >
                    <item.icon className="h-6 w-6 text-primary mb-4" />
                    <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="container max-w-2xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-primary-foreground/70 mb-4">
                Get Started
              </span>
              <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-4 text-balance">
                Ready to explore together?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
                Start a session with a partner, friend, or travel companion. Find outdoor places that work for both of you—privately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="text-base px-8">
                  <Link to={`/auth?redirect=${encodeURIComponent('/together')}`}>Sign In to Start</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/places">Explore Places</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </PageLayout>
    );
  }

  // Show active session results
  if (hasActiveSession && activeSession) {
    return (
      <PageLayout>
        <SEOHead
          title={`Discovering with ${activeSession.partner_name}`}
          description="Find places you'll both love"
          canonicalPath="/together"
        />
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate('/places')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Places
          </Button>
          
          <OverlapResults
            partnerName={activeSession.partner_name}
            expiresAt={activeSession.expires_at}
            onEndSession={endSession}
            isEnding={isEnding}
          />
        </div>
      </PageLayout>
    );
  }

  // Show waiting state when pending session exists
  if (isWaitingForPartner && pendingSession) {
    return (
      <PageLayout>
        <SEOHead
          title="Waiting for Partner"
          description="Share the code to start discovering together"
          canonicalPath="/together"
        />
        <div className="container max-w-md mx-auto px-4 py-12">
          <SessionGenerator
            token={pendingSession.token}
            expiresAt={pendingSession.expires_at}
            onCancel={cancelPending}
            isCancelling={isEnding}
          />
        </div>
      </PageLayout>
    );
  }

  // Default: Show create/join options for authenticated users
  return (
    <PageLayout>
      <SEOHead
        title="Discover Outdoor Places Together"
        description="Find outdoor places that work for two people—privately. A place-first tool for planning hikes, trips, and shared experiences without sharing preferences."
        keywords="couples hiking, outdoor planning, shared discovery, private recommendations, trip planning"
        canonicalPath="/together"
      />
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Discover Together</h1>
          <p className="text-muted-foreground">
            Find outdoor places that work for both of you—privately.
          </p>
        </div>

        <SessionJoin
          onJoin={joinSession}
          onCreateNew={createSession}
          isJoining={isJoining}
          isCreating={isCreating}
          initialToken={urlToken}
        />

        <div className="mt-8 text-center text-xs text-muted-foreground space-y-1">
          <p>Sessions expire after 24 hours</p>
          <p>Your preferences stay private — only shared recommendations are shown</p>
        </div>
      </div>
    </PageLayout>
  );
}
