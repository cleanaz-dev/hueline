"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwner } from "@/context/owner-context";

export default function ReportTaskDialog() {
  const { reportTaskDialogOpen, setReportTaskDialogOpen, reportTask } =
    useOwner();

  const [taskId, setTaskId] = useState("");
  const [reportText, setReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId.trim()) {
      setError("Please enter a task ID.");
      return;
    }
    if (!reportText.trim()) {
      setError("Please enter your report.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await reportTask(reportText.trim(), taskId.trim());
      if (success) {
        setTaskId("");
        setReportText("");
        setReportTaskDialogOpen(false);
      } else {
        setError("Failed to submit report. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={reportTaskDialogOpen} onOpenChange={setReportTaskDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report Task</DialogTitle>
            <DialogDescription>Enter your information below</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskId" className="text-right">
                Task ID
              </Label>
              <Input
                id="taskId"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Enter task ID"
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="report" className="text-right mt-2">
                Report
              </Label>
              <Textarea
                id="report"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe the issue or report details..."
                className="col-span-3 min-h-20"
                rows={5}
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReportTaskDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
