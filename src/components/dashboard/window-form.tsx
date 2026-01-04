"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { createCapacityWindow, updateCapacityWindow, createCapacityWindowsForRange } from "@/app/actions/capacity-windows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const isEditing = !!capacityWindow;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Format today as YYYY-MM-DD for the single date input's min attribute
  const todayString = format(today, "yyyy-MM-dd");

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
        <div id="range-date-panel" role="tabpanel" aria-labelledby="range-tab" className="space-y-2">
          <Label>Select Date Range</Label>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            minDate={today}
            disabled={isPending}
            placeholder="Click to select dates"
          />
          {/* Hidden inputs for form submission */}
          <input
            type="hidden"
            name="start_date"
            value={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
          />
          <input
            type="hidden"
            name="end_date"
            value={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
          />
          <p className="text-xs text-muted-foreground">
            Click a start date, then click an end date. All dates in the range will be created.
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
            min={isEditing ? undefined : todayString}
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
