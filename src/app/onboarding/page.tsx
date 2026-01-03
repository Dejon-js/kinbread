import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Set Up Your Bakery - Kinbread",
  description: "Complete your bakery profile to start managing capacity",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Kinbread</h1>
        <p className="text-muted-foreground">Let&apos;s set up your bakery</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Profile</CardTitle>
          <CardDescription>
            Tell us about your bakery so customers can find you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
