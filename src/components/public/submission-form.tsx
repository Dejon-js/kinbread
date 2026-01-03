"use client";

import { useState } from "react";
import { createSubmission } from "@/app/actions/submissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubmissionFormProps {
  windowId: string;
  slug: string;
  date: string;
  timezone: string;
}

export function SubmissionForm({ windowId, slug, date, timezone }: SubmissionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      const result = await createSubmission(windowId, slug, formData);
      if (!result.success) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <div className="text-sm text-muted-foreground">Booking for</div>
        <div className="text-lg font-semibold">{formattedDate}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_name">Your Name *</Label>
        <Input
          id="customer_name"
          name="customer_name"
          placeholder="Jane Smith"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_email">Email *</Label>
        <Input
          id="customer_email"
          name="customer_email"
          type="email"
          placeholder="jane@example.com"
          required
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          The baker will contact you here
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_phone">Phone (optional)</Label>
        <Input
          id="customer_phone"
          name="customer_phone"
          type="tel"
          placeholder="555-123-4567"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What are you looking for? *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder='e.g., 6" chocolate cake with vanilla buttercream for a birthday, serving 8-10 people'
          required
          disabled={isPending}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Include details like size, flavors, event type, and any dietary requirements
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (optional)</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            placeholder="1"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget_range">Budget (optional)</Label>
          <Input
            id="budget_range"
            name="budget_range"
            placeholder="$50-75"
            disabled={isPending}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Request"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By submitting, you&apos;re requesting a spot. The baker will reach out to confirm details and pricing.
      </p>
    </form>
  );
}
