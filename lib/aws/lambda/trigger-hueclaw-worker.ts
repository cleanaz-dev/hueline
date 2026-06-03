import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

// 1. BUYING THE INTERCOM
// We tell Next.js to connect to your AWS account.
const lambda = new LambdaClient({ region: "us-east-1" });

export async function triggerHueClawWorker(workerName: string, customerData: any) {
  
  // 2. WRITING THE STICKY NOTE
  // We package up all the info the AI needs into a JSON format.
  // We also include the "Return Address" (the Webhook URL) so the AI knows where to send the result!
  const payload = JSON.stringify({
    data: customerData,
    returnAddress: "https://www.hue-line.com/api/webhooks/hue-claw" 
  });

  // 3. DIALING THE RIGHT EXTENSION
  const command = new InvokeCommand({
    FunctionName: workerName, // e.g., "hueline-hueclaw-comms-PROD"
    
    // ⭐️ THE MOST IMPORTANT LINE ⭐️
    // "Event" means "Fire and Forget". It tells Next.js:
    // "Drop the message off and immediately hang up the phone. DO NOT wait for a reply."
    InvocationType: "Event", 
    
    Payload: Buffer.from(payload), // Sliding the sticky note under the door
  });

  // 4. PRESSING THE 'SEND' BUTTON
  // This actually sends the command to AWS. Because of "Event", this finishes instantly.
  await lambda.send(command);
}