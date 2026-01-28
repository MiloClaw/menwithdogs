import { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, PenLine, Link as LinkIcon, Sparkles, ArrowRight, Check, Building, Mountain, BookOpen, Camera, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { useAmbassadorApplication } from '@/hooks/useAmbassadorApplication';
import { useAuth } from '@/hooks/useAuth';

// Form schema - updated for Trail Blazers
const applicationSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  region: z.string().optional(), // Made optional - was city
  regionGooglePlaceId: z.string().optional(),
  regionState: z.string().optional(),
  regionCountry: z.string().default('US'),
  specificPlaces: z.string().min(20, 'Please share at least 2-3 places').max(500, 'Please keep it under 500 characters'),
  expertiseArea: z.string().min(20, 'Please share a bit more about your expertise').max(500, 'Please keep it under 500 characters'),
  hasBusinessAffiliation: z.boolean().default(false),
  businessAffiliationDetails: z.string().optional(),
  existingContent: z.string().optional(), // Was localKnowledge
  contentLinks: z.string().optional(), // Was socialLinks
  email: z.string().email('Please enter a valid email'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

// Animation variants with proper typing
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const Ambassadors = () => {
  const { user } = useAuth();
  const { submitApplication, isSubmitting, isSubmitted } = useAmbassadorApplication();
  
  // Parallax refs
  const heroRef = useRef<HTMLDivElement>(null);
  const boundariesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: boundariesProgress } = useScroll({ target: boundariesRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] });
  
  const heroY = useTransform(heroProgress, [0, 1], ['-10%', '10%']);
  const boundariesY = useTransform(boundariesProgress, [0, 1], ['-15%', '15%']);
  const ctaY = useTransform(ctaProgress, [0, 1], ['-10%', '10%']);

  // Form
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: '',
      region: '',
      regionGooglePlaceId: '',
      regionState: '',
      regionCountry: 'US',
      specificPlaces: '',
      expertiseArea: '',
      hasBusinessAffiliation: false,
      businessAffiliationDetails: '',
      existingContent: '',
      contentLinks: '',
      email: user?.email || '',
    },
  });

  const watchBusinessAffiliation = form.watch('hasBusinessAffiliation');

  const onSubmit = async (data: ApplicationFormData) => {
    await submitApplication({
      name: data.name,
      cityName: data.region || 'Not specified', // Map to existing DB field
      cityGooglePlaceId: data.regionGooglePlaceId,
      cityState: data.regionState,
      cityCountry: data.regionCountry,
      tenure: 'not_applicable', // Default value for DB compatibility
      specificPlaces: data.specificPlaces,
      motivation: data.expertiseArea, // Map to existing DB field
      hasBusinessAffiliation: data.hasBusinessAffiliation,
      businessAffiliationDetails: data.businessAffiliationDetails,
      localKnowledge: data.existingContent || 'Not provided', // Map to existing DB field
      socialLinks: data.contentLinks,
      email: data.email,
    });
  };

  return (
    <PageLayout>
      <SEOHead
        title="Trail Blazers | ThickTimber"
        description="Share your expertise on outdoor spaces and active lifestyles. Trail Blazers are trusted voices who add depth to the directory."
        canonicalPath="/ambassadors"
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-28 md:py-40">
        {/* Ghost Element */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <Mountain className="w-[14rem] h-[14rem] md:w-[22rem] md:h-[22rem] text-foreground/[0.03]" strokeWidth={0.5} />
        </motion.div>

        <div className="container relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
              Trail Blazers
            </motion.p>
            
            <motion.h1 variants={fadeInUp} className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
              Share your knowledge of outdoor spaces and active lifestyles
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
              Trail Blazers are trusted voices who add depth and perspective to outdoor places—helping others explore more intentionally.
            </motion.p>

            <motion.div variants={fadeInUp} className="pt-4">
              <Button asChild size="lg" className="text-base">
                <a href="#apply">Apply to Be a Trail Blazer</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What Are Trail Blazers */}
      <section className="py-28 md:py-40 border-t border-border/40">
        <div className="container max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="max-w-2xl">
              <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                What This Is
              </motion.p>
            </div>

            <motion.div variants={fadeInUp} className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p className="text-pretty">
                Trail Blazers are writers, photographers, guides, and community voices who share meaningful knowledge about outdoor spaces and active lifestyles.
              </p>
              <p className="text-pretty">
                Some Trail Blazers publish long-form writing or guides. Others document personal experiences, seasonal insights, or activity-specific perspectives. What they share adds context to places—not promotion.
              </p>
              <p className="text-foreground font-medium text-pretty">
                This program exists to highlight expertise, not influence. All contributions are reviewed for quality over quantity.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-4 gap-6 pt-8">
              {[
                { icon: PenLine, label: 'Writers' },
                { icon: Camera, label: 'Photographers' },
                { icon: Mountain, label: 'Guides' },
                { icon: Users, label: 'Community Voices' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How Trail Blazers Contribute */}
      <section className="py-28 md:py-40 bg-muted/30 border-t border-border/40">
        <div className="container max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="max-w-2xl">
              <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                How It Works
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
                How Trail Blazers Contribute
              </motion.h2>
            </div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <p className="text-lg text-muted-foreground">Trail Blazers may:</p>
              <ul className="space-y-4 text-lg text-muted-foreground">
                {[
                  'Submit outdoor places relevant to hiking, camping, beaches, running, cycling, or other active pursuits',
                  'Add short context about how a place is used, when it\'s best experienced, or what makes it unique',
                  'Optionally include a link to an existing article, guide, or post they\'ve published',
                  'Share activity-specific or seasonal considerations',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="text-accent mt-1.5">•</span>
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <p className="text-muted-foreground text-lg border-l-4 border-accent pl-6">
                All submissions are reviewed to ensure they add value and align with the platform's purpose.
              </p>
              <p className="text-muted-foreground text-lg">
                Participation does not require promotion, backlinks, or ongoing contribution.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* For Writers & Subject-Matter Experts */}
      <section className="py-28 md:py-40 border-t border-border/40">
        <div className="container max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="max-w-2xl">
              <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                For Writers, Guides & Experts
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
                If you publish content related to outdoor spaces or active lifestyles
              </motion.h2>
            </div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <ul className="space-y-4 text-lg text-muted-foreground">
                {[
                  'You may include links to existing articles or guides when contributing places',
                  'Approved links appear as contextual references, not advertisements',
                  'This helps readers discover deeper expertise while keeping the directory focused on places',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="text-accent mt-1.5">•</span>
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <p className="text-foreground text-lg font-medium">
                Trail Blazer links are selected based on relevance and quality—not reach or follower count.
              </p>
              <p className="text-muted-foreground text-lg">
                Trail Blazer contributions are selected for relevance and experience with this type of place.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Clear Boundaries - Dark Section */}
      <section ref={boundariesRef} className="relative py-28 md:py-40 bg-primary text-primary-foreground overflow-hidden">
        {/* Ghost Element */}
        <motion.div
          style={{ y: boundariesY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="text-[16rem] md:text-[24rem] font-serif font-bold text-primary-foreground/[0.03] leading-none">
            ×
          </span>
        </motion.div>

        <div className="container relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-primary-foreground/60">
              Clear Boundaries
            </motion.p>

            <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              This is not:
            </motion.h2>

            <motion.ul variants={fadeInUp} className="space-y-6 text-lg md:text-xl">
              {[
                'An influencer or ambassador program',
                'A sponsorship or promotional channel',
                'A ranking system or leaderboard',
                'A public profile or follower mechanism',
                'A requirement to promote ThickTimber',
              ].map((item, index) => (
                <motion.li
                  key={index}
                  variants={fadeInUp}
                  className="flex items-start gap-4 text-primary-foreground/80"
                >
                  <span className="text-primary-foreground/40 mt-1">—</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.p variants={fadeInUp} className="text-primary-foreground/60 text-lg">
              Trail Blazers participate as contributors, not representatives.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-28 md:py-40 bg-muted/30 border-t border-border/40">
        <div className="container max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="max-w-2xl">
              <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                What You Get
              </motion.p>
            </div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <p className="text-lg text-muted-foreground">Trail Blazers may receive:</p>
              <ul className="space-y-4 text-lg text-muted-foreground">
                {[
                  'Complimentary PRO access (limited and reviewed periodically)',
                  'Optional attribution for approved contextual links',
                  'Early access to new features related to places or activities',
                  'A platform that surfaces your expertise where it\'s most useful',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="text-accent mt-1.5">•</span>
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg border-l-4 border-accent pl-6">
              Participation is optional and can be paused or ended at any time.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-28 md:py-40 border-t border-border/40">
        <div className="container max-w-2xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div>
              <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Get Involved
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg">
                Applications are reviewed for quality, relevance, and intent. There is no requirement to focus on a specific location or audience.
              </motion.p>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/50 rounded-2xl p-8 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-serif text-2xl font-semibold">Thanks for applying</h3>
                <p className="text-muted-foreground">We'll review your submission and be in touch if there's a fit.</p>
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp}>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First name or preferred name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Region (Optional) */}
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Primary region
                            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <GooglePlacesAutocomplete
                              value={field.value || ''}
                              onChange={field.onChange}
                              onPlaceSelect={(place) => {
                                field.onChange(place?.name || '');
                                form.setValue('regionGooglePlaceId', place?.place_id || '');
                                const addressParts = place?.formatted_address?.split(', ') || [];
                                const state = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : '';
                                const country = addressParts.length >= 1 ? addressParts[addressParts.length - 1] : 'US';
                                form.setValue('regionState', state || '');
                                form.setValue('regionCountry', country || 'US');
                              }}
                              placeholder="Search for a region, state, or country..."
                              types="(regions)"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Not required. Trail Blazers can contribute from anywhere.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Specific Places */}
                    <FormField
                      control={form.control}
                      name="specificPlaces"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>2-3 outdoor places you'd recommend adding to the directory</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Trails, campsites, beaches, swimming holes — places worth knowing about"
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Be specific about location and what makes each place notable. {field.value?.length || 0}/500 characters
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Expertise Area */}
                    <FormField
                      control={form.control}
                      name="expertiseArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What areas of outdoor or active-lifestyle expertise do you focus on?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Hiking, camping, trail running, cycling, swimming — tell us about your focus areas"
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            {field.value?.length || 0}/500 characters
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Business Affiliation */}
                    <FormField
                      control={form.control}
                      name="hasBusinessAffiliation"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Do you own or work at any outdoor-related businesses?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === 'yes')}
                              value={field.value ? 'yes' : 'no'}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="no" className="h-5 w-5" />
                                <label htmlFor="no" className="text-sm cursor-pointer">No</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="yes" className="h-5 w-5" />
                                <label htmlFor="yes" className="text-sm cursor-pointer">Yes</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            This helps us understand potential affiliations — it won't disqualify you.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Business Affiliation Details - Conditional */}
                    {watchBusinessAffiliation && (
                      <FormField
                        control={form.control}
                        name="businessAffiliationDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Please describe your affiliation</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What business(es) and your role..."
                                className="min-h-[80px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Existing Content */}
                    <FormField
                      control={form.control}
                      name="existingContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Do you have existing writing, guides, or published content?
                            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about any blogs, publications, or guides you've created..."
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Content Links (Optional) */}
                    <FormField
                      control={form.control}
                      name="contentLinks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Links to relevant writing or guides
                            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Blog, publication, guide platform, etc."
                              className="min-h-[80px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Links are reviewed for relevance and quality.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Apply to Be a Trail Blazer'}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Footer - Dark Section */}
      <section ref={ctaRef} className="relative py-28 md:py-40 bg-primary text-primary-foreground overflow-hidden">
        {/* Ghost Element */}
        <motion.div
          style={{ y: ctaY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <ArrowRight className="w-[16rem] h-[16rem] md:w-[24rem] md:h-[24rem] text-primary-foreground/[0.03]" strokeWidth={1} />
        </motion.div>

        <div className="container relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-primary-foreground/60">
              Not Ready Yet?
            </motion.p>
            
            <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              Explore the directory first
            </motion.h2>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-base"
              >
                <Link to="/places">Explore Places</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/10 text-base"
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Ambassadors;
