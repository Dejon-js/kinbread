"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { deleteCapacityWindow } from "@/app/actions/capacity-windows";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CapacityBadge } from "./capacity-badge";
import { SubmissionsList } from "./submissions-list";
import { formatDate } from "@/lib/utils/dates";
import type { WindowWithSubmissions } from "@/types";

interface WindowDetailProps {
  window: WindowWithSubmissions;
  timezone: string;
}

export function WindowDetail({ window, timezone }: WindowDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteCapacityWindow(window.id);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setDeleteError(result.error);
      }
    } catch {
      setDeleteError("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dates
          </Link>
          <h1 className="text-2xl font-bold">
            {formatDate(window.date, timezone)}
          </h1>
          {window.note && (
            <p className="text-muted-foreground mt-1">{window.note}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CapacityBadge used={window.used_slots} total={window.total_slots} />
          <Link href={`/dashboard/windows/${window.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Date</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {formatDate(window.date, timezone)}?
                  {window.submissions.length > 0 && (
                    <span className="block mt-2 text-destructive font-medium">
                      This date has {window.submissions.length} submission(s).
                      You must delete all submissions first.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              {deleteError && (
                <Alert variant="destructive">
                  <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || window.submissions.length > 0}
                >
                  {isDeleting ? "Deleting..." : "Delete Date"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Capacity Info */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">{window.total_slots}</div>
          <div className="text-sm text-muted-foreground">Total Slots</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{window.used_slots}</div>
          <div className="text-sm text-muted-foreground">Booked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{window.available_slots}</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
      </div>

      {/* Submissions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Submissions ({window.submissions.length})
        </h2>
        <SubmissionsList submissions={window.submissions} timezone={timezone} />
      </div>
    </div>
  );
}
