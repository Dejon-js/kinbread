import { notFound } from "next/navigation";
import { WindowDetail } from "@/components/dashboard/window-detail";
import { getCurrentBaker } from "@/lib/queries/baker";
import { getWindowWithSubmissions } from "@/lib/queries/capacity-windows";

interface WindowPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WindowPageProps) {
  const { id } = await params;
  return {
    title: `Date Details - Kinbread`,
    description: "View and manage date capacity",
  };
}

export default async function WindowPage({ params }: WindowPageProps) {
  const { id } = await params;
  const baker = await getCurrentBaker();

  if (!baker) {
    return null; // Layout handles redirect
  }

  const window = await getWindowWithSubmissions(id, baker.id);

  if (!window) {
    notFound();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <WindowDetail window={window} timezone={baker.timezone} />
    </div>
  );
}
