import { notFound } from "next/navigation";
import { ConfirmationMessage } from "@/components/public/confirmation-message";
import { getBakerBySlug } from "@/lib/queries/baker";
import { Card, CardContent } from "@/components/ui/card";

interface ConfirmationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ConfirmationPageProps) {
  const { slug } = await params;
  const baker = await getBakerBySlug(slug);

  if (!baker) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `Request Submitted - ${baker.business_name}`,
    description: "Your booking request has been submitted",
  };
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { slug } = await params;
  const baker = await getBakerBySlug(slug);

  if (!baker) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-lg mx-auto p-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <ConfirmationMessage
              businessName={baker.business_name}
              slug={slug}
            />
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Powered by Kinbread
        </p>
      </div>
    </div>
  );
}
