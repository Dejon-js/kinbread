import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubmissionForm } from "@/components/public/submission-form";
import { getBakerBySlug } from "@/lib/queries/baker";
import { getWindowForBooking } from "@/lib/queries/capacity-windows";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingPageProps {
  params: Promise<{ slug: string; windowId: string }>;
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { slug } = await params;
  const baker = await getBakerBySlug(slug);

  if (!baker) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `Book with ${baker.business_name}`,
    description: `Submit a booking request to ${baker.business_name}`,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug, windowId } = await params;
  const baker = await getBakerBySlug(slug);

  if (!baker) {
    notFound();
  }

  const windowData = await getWindowForBooking(windowId, baker.id);

  if (!windowData) {
    notFound();
  }

  const { window, available } = windowData;

  // If not available, redirect to availability page
  if (!available) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-lg mx-auto p-4 py-8">
        <Link
          href={`/${slug}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dates
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{baker.business_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              windowId={windowId}
              slug={slug}
              date={window.date}
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
