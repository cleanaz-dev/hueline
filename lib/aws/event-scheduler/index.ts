import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
} from "@aws-sdk/client-scheduler";

const schedulerClient = new SchedulerClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function scheduleAWSFollowUp({
  threadId,
  triggerAt,
  slug,
  trigger,
}: {
  threadId: string;
  triggerAt: Date;
  slug: string;
  trigger: string;
}) {
  const scheduleName = `Nudge-${threadId}-${Date.now()}`;
  const formattedDate = triggerAt.toISOString().split(".")[0];

  try {
    const command = new CreateScheduleCommand({
      Name: scheduleName,
      FlexibleTimeWindow: { Mode: "OFF" },
      ScheduleExpression: `at(${formattedDate})`,
      Target: {
        RoleArn: process.env.AWS_EVENTBRIDGE_ROLE_ARN!, // Role that allows Scheduler -> Lambda
        Arn: process.env.AWS_HUECLAW_FOLLOWUP_LAMBDA_ARN!, 
        Input: JSON.stringify({ threadId, slug, trigger }),
      },
      ActionAfterCompletion: "DELETE",
    });

    await schedulerClient.send(command);
    console.log(
      `[EventBridge] 🕒 Scheduled AWS nudge: ${scheduleName} at ${formattedDate}`,
    );

    return scheduleName; // Return this so Next.js can save it to Prisma
  } catch (error) {
    console.error(
      `[EventBridge Error] Failed to schedule nudge for thread ${threadId}:`,
      error,
    );
    throw error;
  }
}

export async function deleteAWSSchedule(scheduleName: string) {
  try {
    const command = new DeleteScheduleCommand({ Name: scheduleName });
    await schedulerClient.send(command);
    console.log(`[EventBridge] 🗑️ Deleted AWS schedule: ${scheduleName}`);
  } catch (error: any) {
    // If it's a 404 ResourceNotFoundException, it means it already fired or was deleted. We can safely ignore it.
    if (error.name === "ResourceNotFoundException") {
      console.log(
        `[EventBridge] ⚠️ Schedule ${scheduleName} not found (already deleted/fired)`,
      );
      return;
    }
    console.error(
      `[EventBridge Error] Failed to delete schedule ${scheduleName}:`,
      error,
    );
    throw error;
  }
}
