import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WindowForm } from "@/components/dashboard/window-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Add Date - Kinbread",
  description: "Add a new availability date",
};

export default function NewWindowPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dates
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add Availability Date</CardTitle>
          <CardDescription>
            Set up a new date when you can take orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WindowForm />
        </CardContent>
      </Card>
    </div>
  );
}
