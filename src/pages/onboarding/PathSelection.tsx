import { useNavigate } from "react-router-dom";
import { Users, User, Lock } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PathSelection = () => {
  const navigate = useNavigate();

  const handleCoupleSelect = () => {
    navigate('/onboarding/create-couple');
  };

  const handleIndividualSelect = () => {
    toast.info("Individual accounts are coming soon. Join as a couple to get started.");
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={5}
      title="How will you use MainStreetIRL?"
      subtitle="Choose the path that fits your community journey."
    >
      <div className="space-y-4 w-full max-w-sm mx-auto">
        {/* Couple Path - Enabled */}
        <Card 
          className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
          onClick={handleCoupleSelect}
        >
          <CardHeader className="flex flex-row items-start gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground mb-1">
                As a Couple
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                We're in a relationship and want community together.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Individual Path - Disabled */}
        <Card 
          className="cursor-not-allowed opacity-60 relative"
          onClick={handleIndividualSelect}
        >
          <CardHeader className="flex flex-row items-start gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-semibold text-muted-foreground">
                  As an Individual
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                  <Lock className="w-3 h-3 mr-1" />
                  Coming Soon
                </Badge>
              </div>
              <CardDescription className="text-sm text-muted-foreground/70 leading-relaxed">
                I'm looking to connect as myself.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8 max-w-xs mx-auto">
        This helps tailor insights and recommendations. It does not affect how you engage in real life.
      </p>
    </OnboardingLayout>
  );
};

export default PathSelection;
