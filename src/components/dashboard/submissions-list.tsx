import { SubmissionCard } from "./submission-card";
import type { Submission } from "@/types";

interface SubmissionsListProps {
  submissions: Submission[];
  timezone: string;
}

export function SubmissionsList({ submissions, timezone }: SubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No submissions yet for this date</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} timezone={timezone} />
      ))}
    </div>
  );
}
