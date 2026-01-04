"use client";

import { useState, useEffect } from "react";
import { createBakerProfile, checkSlugAvailability } from "@/app/actions/baker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONE_OPTIONS } from "@/lib/utils/dates";
import { slugify } from "@/lib/utils/slugify";
import { Check, X, Loader2 } from "lucide-react";

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [autoSlug, setAutoSlug] = useState(true);

  // Auto-generate slug from business name
  useEffect(() => {
    if (autoSlug && businessName) {
      const generatedSlug = slugify(businessName);
      setSlug(generatedSlug);
    }
  }, [businessName, autoSlug]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || slug.length < 1) {
      setSlugStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus("checking");
      const result = await checkSlugAvailability(slug);
      if (result.success) {
        setSlugStatus(result.data.available ? "available" : "taken");
      } else {
        setSlugStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      const result = await createBakerProfile(formData);
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

      <div className="space-y-2">
        <Label htmlFor="business_name">Business Name</Label>
        <Input
          id="business_name"
          name="business_name"
          placeholder="Sweet Delights Bakery"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          This will be shown to your customers
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Your Link</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            kinbread.com/
          </span>
          <div className="relative flex-1">
            <Input
              id="slug"
              name="slug"
              placeholder="your-bakery"
              value={slug}
              onChange={(e) => {
                setAutoSlug(false);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              required
              disabled={isPending}
              className="pr-8"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {slugStatus === "checking" && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {slugStatus === "available" && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              {slugStatus === "taken" && (
                <X className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        </div>
        {slugStatus === "taken" && (
          <p className="text-xs text-red-600">
            This link is already taken. Please choose another.
          </p>
        )}
        {slugStatus === "available" && (
          <p className="text-xs text-green-600">
            This link is available!
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select name="timezone" defaultValue="America/New_York">
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Dates will be displayed in this timezone
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || slugStatus === "taken" || slugStatus === "checking"}
      >
        {isPending ? "Setting up..." : "Complete Setup"}
      </Button>
    </form>
  );
}
