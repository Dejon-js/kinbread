import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ConfirmationMessageProps {
  businessName: string;
  slug: string;
}

export function ConfirmationMessage({ businessName, slug }: ConfirmationMessageProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Request Submitted!</h1>

      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Thank you for your interest! {businessName} has received your request and will
        reach out to you via email to discuss details and confirm your order.
      </p>

      <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
        <h3 className="font-medium mb-2">What happens next?</h3>
        <ul className="text-sm text-muted-foreground text-left space-y-2">
          <li>1. The baker reviews your request</li>
          <li>2. They&apos;ll email you to discuss details</li>
          <li>3. You finalize and confirm your order</li>
        </ul>
      </div>

      <Link href={`/${slug}`}>
        <Button variant="outline">
          Back to availability
        </Button>
      </Link>
    </div>
  );
}
