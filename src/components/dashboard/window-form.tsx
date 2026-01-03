"use client";

import { useState } from "react";
import { createCapacityWindow, updateCapacityWindow } from "@/app/actions/capacity-windows";
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const isEditing = !!capacityWindow;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      if (isEditing && capacityWindow) {
        const result = await updateCapacityWindow(capacityWindow.id, formData);
        if (!result.success) {
          setError(result.error);
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={capacityWindow?.date}
          min={isEditing ? undefined : today}
          required
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          The date this availability is for
        </p>
      </div>

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
        />
        <p className="text-xs text-muted-foreground">
          How many orders can you take on this date? Set to 0 to block the date.
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
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving..."
              : "Adding..."
            : isEditing
            ? "Save Changes"
            : "Add Date"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
