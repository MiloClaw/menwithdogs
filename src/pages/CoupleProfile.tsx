import { MapPin, Calendar } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import InterestTag from "@/components/InterestTag";
import { Card } from "@/components/ui/card";

const interests = [
  "Hiking",
  "Wine Tasting",
  "Board Games",
  "Travel",
  "Cooking",
  "Live Music",
  "Fitness",
  "Photography",
];

const availability = [
  { day: "Weekends", time: "Afternoons & Evenings" },
  { day: "Fridays", time: "After 6 PM" },
];

const activityPreferences = ["Outdoor Activities", "Double Dates", "Group Events", "Casual Hangouts"];

const CoupleProfile = () => {
  return (
    <PageLayout>
      <div className="container py-6 md:py-8 lg:py-12">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 lg:gap-8 items-center sm:items-start mb-8 md:mb-12">
          {/* Profile Photo */}
          <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-muted rounded-full flex-shrink-0" />
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-2">
              Matt & David
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 md:gap-3 text-sm text-muted-foreground mb-3 md:mb-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Brooklyn, NY
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Members since 2024
              </span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Together for 5 years, married for 2. We love exploring the city, trying new restaurants, and hosting game nights. Always looking to connect with like-minded couples.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
            {/* About Section */}
            <Card className="p-4 md:p-6">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">
                About Us
              </h2>
              <div className="text-sm md:text-base text-muted-foreground space-y-3 md:space-y-4">
                <p>
                  We met at a coffee shop in Williamsburg back in 2019—classic Brooklyn story. Matt works in tech and David is a high school English teacher. Between our schedules, we make the most of our weekends exploring everything the city has to offer.
                </p>
                <p>
                  We're the couple that hosts Thanksgiving, plans the group trips, and always has a game night on the calendar. We believe that having couple friends who really get you makes life infinitely better.
                </p>
                <p>
                  Looking to meet other couples who enjoy good conversation, don't take themselves too seriously, and appreciate a well-curated charcuterie board.
                </p>
              </div>
            </Card>

            {/* Interests Section */}
            <Card className="p-4 md:p-6">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">
                Our Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <InterestTag key={interest} label={interest} />
                ))}
              </div>
            </Card>

            {/* Photo Grid */}
            <Card className="p-4 md:p-6">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">
                Our Photos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted rounded-card"
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Availability */}
            <Card className="p-4 md:p-6">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">
                Usually Available
              </h2>
              <div className="space-y-2 md:space-y-3">
                {availability.map((slot) => (
                  <div key={slot.day} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm md:text-base font-medium text-primary">{slot.day}</span>
                    <span className="text-xs md:text-sm text-muted-foreground">{slot.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Activity Preferences */}
            <Card className="p-4 md:p-6">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">
                We're Up For
              </h2>
              <div className="flex flex-wrap gap-2">
                {activityPreferences.map((pref) => (
                  <span key={pref} className="px-2.5 md:px-3 py-1 md:py-1.5 bg-accent/10 text-accent text-xs md:text-sm font-medium rounded-button">
                    {pref}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CoupleProfile;
