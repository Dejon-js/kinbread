import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WindowForm } from "@/components/dashboard/window-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentBaker } from "@/lib/queries/baker";
import { getWindowById } from "@/lib/queries/capacity-windows";
import { formatDate } from "@/lib/utils/dates";

interface EditWindowPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditWindowPageProps) {
  return {
    title: "Edit Date - Kinbread",
    description: "Edit availability date",
  };
}

export default async function EditWindowPage({ params }: EditWindowPageProps) {
  const { id } = await params;
  const baker = await getCurrentBaker();

  if (!baker) {
    return null; // Layout handles redirect
  }

  const window = await getWindowById(id);

  if (!window) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href={`/dashboard/windows/${id}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to date
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit {formatDate(window.date, baker.timezone)}</CardTitle>
          <CardDescription>
            Update the capacity or note for this date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WindowForm capacityWindow={window} />
        </CardContent>
      </Card>
    </div>
  );
}
