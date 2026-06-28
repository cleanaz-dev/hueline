import { createCommand, lambda } from ".";

interface PayloadProps {
  payload: {
    webhookUrl: string;
    transcript: string;
    threadId: string;
    systemTaskId: string;
    config: string
  };
}

export async function invokeCallIntelligenceLambda({ payload }: PayloadProps) {
  const command = createCommand({
    functionName: "hueline-hueclaw-intelligence-PROD",
    payload,
    invocationType: "Event",
  });

  await lambda.send(command);
}
