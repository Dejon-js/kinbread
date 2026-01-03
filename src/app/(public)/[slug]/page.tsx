import { notFound } from "next/navigation";
import { AvailabilityList } from "@/components/public/availability-list";
import { getBakerBySlug } from "@/lib/queries/baker";
import { getPublicWindowsForBaker } from "@/lib/queries/capacity-windows";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicPageProps) {
  const { slug } = await params;
  const baker = await getBakerBySlug(slug);

  if (!baker) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `Book with ${baker.business_name}`,
    description: baker.context_message || `Check availability and book with ${baker.business_name}`,
  };
}

export default async function PublicAvailabilityPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const baker = await getBakerBySlug(slug);

  if (!baker) {
    notFound();
  }

  const windows = await getPublicWindowsForBaker(baker.id, baker.timezone);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-lg mx-auto p-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{baker.business_name}</CardTitle>
            {baker.context_message && (
              <CardDescription className="text-base">
                {baker.context_message}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Available Dates
              </h2>
            </div>
            <AvailabilityList
              windows={windows}
              slug={slug}
              timezone={baker.timezone}
            />
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Powered by Capacity Gate
        </p>
      </div>
    </div>
  );
}
