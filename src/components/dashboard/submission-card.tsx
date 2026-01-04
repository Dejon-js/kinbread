"use client";

import { useState } from "react";
import { Trash2, Mail, Phone, MessageSquare, Package, DollarSign } from "lucide-react";
import { deleteSubmission } from "@/app/actions/submissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatTimestamp } from "@/lib/utils/dates";
import type { Submission } from "@/types";

interface SubmissionCardProps {
  submission: Submission;
  timezone: string;
}

export function SubmissionCard({ submission, timezone }: SubmissionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteSubmission(submission.id);
      if (!result.success) {
        setDeleteError(result.error || "Failed to delete submission");
      } else {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete submission:", error);
      setDeleteError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <div className="font-medium">{submission.customer_name}</div>
              <div className="text-xs text-muted-foreground">
                Submitted {formatTimestamp(submission.submitted_at, timezone)}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href={`mailto:${submission.customer_email}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-3 w-3" />
                {submission.customer_email}
              </a>
              {submission.customer_phone && (
                <a
                  href={`tel:${submission.customer_phone}`}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-3 w-3" />
                  {submission.customer_phone}
                </a>
              )}
            </div>

            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm">{submission.description}</p>
              </div>
            </div>

            {(submission.quantity || submission.budget_range) && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                {submission.quantity && (
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Qty: {submission.quantity}
                  </span>
                )}
                {submission.budget_range && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {submission.budget_range}
                  </span>
                )}
              </div>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Submission</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this submission from {submission.customer_name}?
                  This will free up one slot and cannot be undone.
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
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
