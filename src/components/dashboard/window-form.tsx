"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCapacityWindow, updateCapacityWindow, createCapacityWindowsForRange } from "@/app/actions/capacity-windows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CapacityWindow } from "@/types";

interface WindowFormProps {
  capacityWindow?: CapacityWindow;
}

export function WindowForm({ capacityWindow }: WindowFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isRangeMode, setIsRangeMode] = useState(false);

  const isEditing = !!capacityWindow;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      if (isEditing && capacityWindow) {
        formData.set('id', capacityWindow.id);
        const result = await updateCapacityWindow(formData);
        if (!result.success) {
          setError(result.error);
        }
      } else if (isRangeMode) {
        const result = await createCapacityWindowsForRange(formData);
        if (!result.success) {
          setError(result.error);
        } else {
          const { created, skipped } = result.data;
          if (skipped > 0) {
            setSuccess(`Created ${created} dates. ${skipped} dates were skipped (already exist).`);
          } else {
            setSuccess(`Created ${created} dates successfully!`);
          }
          // Redirect after a brief delay to show success message
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      } else {
        const result = await createCapacityWindow(formData);
        if (!result.success) {
          setError(result.error);
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" id="form-error" role="alert" aria-live="polite">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert id="form-success" role="status" aria-live="polite">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {!isEditing && (
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit" role="tablist" aria-label="Date selection mode">
          <button
            type="button"
            role="tab"
            aria-selected={!isRangeMode}
            aria-controls="single-date-panel"
            onClick={() => setIsRangeMode(false)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              !isRangeMode
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Single Date
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRangeMode}
            aria-controls="range-date-panel"
            onClick={() => setIsRangeMode(true)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isRangeMode
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Date Range
          </button>
        </div>
      )}

      {isRangeMode && !isEditing ? (
        <div id="range-date-panel" role="tabpanel" aria-labelledby="range-tab" className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              min={today}
              required
              disabled={isPending}
              aria-invalid={!!error}
              aria-describedby={error ? "form-error" : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              min={today}
              required
              disabled={isPending}
              aria-invalid={!!error}
              aria-describedby={error ? "form-error" : undefined}
            />
          </div>
          <p className="col-span-2 text-xs text-muted-foreground">
            Create availability for all dates in this range. Existing dates will be skipped.
          </p>
        </div>
      ) : (
        <div id="single-date-panel" role="tabpanel" aria-labelledby="single-tab" className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={capacityWindow?.date}
            min={isEditing ? undefined : today}
            required
            disabled={isPending}
            aria-invalid={!!error}
            aria-describedby={error ? "form-error date-hint" : "date-hint"}
          />
          <p id="date-hint" className="text-xs text-muted-foreground">
            The date this availability is for
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="total_slots">Number of Slots</Label>
        <Input
          id="total_slots"
          name="total_slots"
          type="number"
          min={0}
          max={1000}
          defaultValue={capacityWindow?.total_slots ?? 3}
          required
          disabled={isPending}
          aria-invalid={!!error}
          aria-describedby={error ? "form-error slots-hint" : "slots-hint"}
        />
        <p id="slots-hint" className="text-xs text-muted-foreground">
          How many orders can you take{isRangeMode ? " per day" : " on this date"}? Set to 0 to block {isRangeMode ? "dates" : "the date"}.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          name="note"
          placeholder="e.g., Weekend - extra capacity, Wedding prep day"
          defaultValue={capacityWindow?.note ?? ""}
          disabled={isPending}
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Private note for yourself (not shown to customers)
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || !!success}>
          {isPending
            ? isEditing
              ? "Saving..."
              : isRangeMode
              ? "Creating..."
              : "Adding..."
            : isEditing
            ? "Save Changes"
            : isRangeMode
            ? "Create Dates"
            : "Add Date"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
