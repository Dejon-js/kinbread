import { SettingsForm } from "@/components/settings/settings-form";
import { getCurrentBaker } from "@/lib/queries/baker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Settings - Kinbread",
  description: "Manage your bakery settings",
};

export default async function SettingsPage() {
  const baker = await getCurrentBaker();

  if (!baker) {
    return null; // Layout handles redirect
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your bakery profile and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your business information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm baker={baker} />
        </CardContent>
      </Card>
    </div>
  );
}
