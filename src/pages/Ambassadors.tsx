import { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Calendar, MessageSquare, Gift, Sparkles, ArrowRight, Check, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { useAmbassadorApplication } from '@/hooks/useAmbassadorApplication';
import { useAuth } from '@/hooks/useAuth';

// Form schema
const applicationSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  city: z.string().min(1, 'Please select your city'),
  cityGooglePlaceId: z.string().optional(),
  cityState: z.string().optional(),
  cityCountry: z.string().default('US'),
  tenure: z.string().min(1, 'Please select how long you\'ve lived there'),
  specificPlaces: z.string().min(20, 'Please share at least 2-3 places').max(500, 'Please keep it under 500 characters'),
  motivation: z.string().min(20, 'Please share a bit more about your motivation').max(300, 'Please keep it under 300 characters'),
  hasBusinessAffiliation: z.boolean().default(false),
  businessAffiliationDetails: z.string().optional(),
  localKnowledge: z.string().min(20, 'Please share a bit more about what you know').max(500, 'Please keep it under 500 characters'),
  socialLinks: z.string().optional(),
  email: z.string().email('Please enter a valid email'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const tenureOptions = [
  { value: 'less_than_1_year', label: 'Less than 1 year' },
  { value: '1_3_years', label: '1–3 years' },
  { value: '3_5_years', label: '3–5 years' },
  { value: '5_10_years', label: '5–10 years' },
  { value: '10_plus_years', label: '10+ years' },
];

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
  const notSectionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: notProgress } = useScroll({ target: notSectionRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] });
  
  const heroY = useTransform(heroProgress, [0, 1], ['-10%', '10%']);
  const notY = useTransform(notProgress, [0, 1], ['-15%', '15%']);
  const ctaY = useTransform(ctaProgress, [0, 1], ['-10%', '10%']);

  // Form
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: '',
      city: '',
      cityGooglePlaceId: '',
      cityState: '',
      cityCountry: 'US',
      tenure: '',
      specificPlaces: '',
      motivation: '',
      hasBusinessAffiliation: false,
      businessAffiliationDetails: '',
      localKnowledge: '',
      socialLinks: '',
      email: user?.email || '',
    },
  });

  const watchBusinessAffiliation = form.watch('hasBusinessAffiliation');

  const onSubmit = async (data: ApplicationFormData) => {
    await submitApplication({
      name: data.name,
      cityName: data.city,
      cityGooglePlaceId: data.cityGooglePlaceId,
      cityState: data.cityState,
      cityCountry: data.cityCountry,
      tenure: data.tenure,
      specificPlaces: data.specificPlaces,
      motivation: data.motivation,
      hasBusinessAffiliation: data.hasBusinessAffiliation,
      businessAffiliationDetails: data.businessAffiliationDetails,
      localKnowledge: data.localKnowledge,
      socialLinks: data.socialLinks,
      email: data.email,
    });
  };

  return (
    <PageLayout>
      <SEOHead
        title="Ambassador Program | ThickTimber"
        description="Help shape the outdoor places that define your region. Join our Ambassador Program and contribute to a directory that reflects where outdoor gay men actually go."
        canonicalPath="/ambassadors"
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-28 md:py-40">
        {/* Ghost Element */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="text-[14rem] md:text-[22rem] font-serif font-bold text-foreground/[0.03] leading-none">
            &
          </span>
        </motion.div>

        <div className="container relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
              Ambassador Program
            </motion.p>
            
            <motion.h1 variants={fadeInUp} className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
              Help Shape the Places That Define Your City
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
              We're looking for gay men who know the outdoors well — the hidden trails, the best campsites, the swimming holes that don't show up on maps. Help us build a directory that reflects where outdoor gay men actually go.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* What Ambassadors Do */}
      <section className="py-28 md:py-40 border-t border-border/40">
        <div className="container max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="max-w-2xl">
              <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                What This Is
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
                Quietly shape how your city is represented
              </motion.h2>
            </div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  icon: MapPin,
                  title: 'Submit outdoor spots',
                  description: 'Add hiking trails, campsites, beaches, and swimming holes that matter to your community.',
                },
                {
                  icon: Calendar,
                  title: 'Flag group events',
                  description: 'Highlight hiking groups, camping weekends, outdoor meetups worth knowing about.',
                },
                {
                  icon: MessageSquare,
                  title: 'Share local context',
                  description: 'Add tips and insights only a local would know — trail conditions, best times to visit, hidden gems.',
                },
              ].map((item, index) => (
                <div key={index} className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-pretty">{item.description}</p>
                </div>
              ))}
            </motion.div>

            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg border-l-4 border-accent pl-6">
              Contributions are about places, not people. No posting quotas. No performance metrics.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* What This Is Not - Dark Section */}
      <section ref={notSectionRef} className="relative py-28 md:py-40 bg-primary text-primary-foreground overflow-hidden">
        {/* Ghost Element */}
        <motion.div
          style={{ y: notY }}
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
            <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              This is stewardship, not promotion.
            </motion.h2>

            <motion.ul variants={fadeInUp} className="space-y-6 text-lg md:text-xl">
              {[
                'Not a dating app',
                'Not a social network',
                'Not an influencer or brand partnership program',
                'No public profiles, rankings, or visibility tied to participation',
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
              We built this to filter for the right people — thoughtful locals, not promoters.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-28 md:py-40 border-t border-border/40">
        <div className="container max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-12 md:gap-20"
          >
            <div>
              <motion.p variants={fadeInUp} className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Ideal Ambassador
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
                You know your city. Not just the nightlife.
              </motion.h2>
            </div>

            <motion.div variants={fadeInUp} className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p className="text-pretty">
                Gay men who have spent time exploring the outdoors in their region — its trails, its campgrounds, its hidden spots.
              </p>
              <p className="text-pretty">
                People who know the "in-between" places — the unmarked swimming holes, the quiet trails, the campsites that aren't on anyone's radar yet.
              </p>
              <p className="text-pretty">
                Those who value community, nature, and real-world connection. Comfortable contributing quietly, without being on display.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What Ambassadors Receive */}
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
              <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
                Access and contribution — not rewards.
              </motion.h2>
            </div>

            <motion.div variants={fadeInUp} className="space-y-6">
              {[
                { icon: Gift, text: 'Complimentary Pro membership (limited slots per city)' },
                { icon: Sparkles, text: 'Early access to new city tools and features' },
                { icon: MapPin, text: 'A direct way to help shape how your city is represented' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-lg text-foreground pt-2">{item.text}</p>
                </div>
              ))}
            </motion.div>
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
                Apply
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-balance mb-4">
                A short, respectful application
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg">
                No essays. No personality tests. Used only to understand fit and local context. Your information is private.
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
                <p className="text-muted-foreground">We'll be in touch if there's a fit.</p>
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

                    {/* City */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <GooglePlacesAutocomplete
                              value={field.value}
                              onChange={field.onChange}
                              onPlaceSelect={(place) => {
                                field.onChange(place?.name || '');
                                form.setValue('cityGooglePlaceId', place?.place_id || '');
                                const addressParts = place?.formatted_address?.split(', ') || [];
                                const state = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : '';
                                const country = addressParts.length >= 1 ? addressParts[addressParts.length - 1] : 'US';
                                form.setValue('cityState', state || '');
                                form.setValue('cityCountry', country || 'US');
                              }}
                              placeholder="Search for your city..."
                              types="(cities)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tenure */}
                    <FormField
                      control={form.control}
                      name="tenure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How long have you lived there?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tenureOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Specific Places - NEW */}
                    <FormField
                      control={form.control}
                      name="specificPlaces"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name 2-3 local places you'd recommend that most visitors wouldn't know about</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A coffee shop, a bookstore, a park, a gym — the spots only locals know"
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Be specific. This helps us understand your local knowledge. {field.value?.length || 0}/500 characters
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Motivation - NEW */}
                    <FormField
                      control={form.control}
                      name="motivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why do you want to help shape your city's directory?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What draws you to this?"
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            A sentence or two is fine. {field.value?.length || 0}/300 characters
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Business Affiliation - NEW */}
                    <FormField
                      control={form.control}
                      name="hasBusinessAffiliation"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Do you own or work at any local businesses?</FormLabel>
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

                    {/* Local Knowledge */}
                    <FormField
                      control={form.control}
                      name="localKnowledge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What kind of local places or events do you know well?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about the spots you'd recommend — coffee shops, gyms, bookstores, events..."
                              className="min-h-[120px] resize-none"
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

                    {/* Social Links (Optional) */}
                    <FormField
                      control={form.control}
                      name="socialLinks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Links to social or online presence
                            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Instagram, Twitter, blog, etc."
                              className="min-h-[80px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Optional. Used only for context, not promotion.
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
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
