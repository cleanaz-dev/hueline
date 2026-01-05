import { egressClient } from "../config";
import { EncodedFileOutput, S3Upload, EncodedFileType, EncodingOptionsPreset } from "livekit-server-sdk";

export async function startRoomRecording(roomName: string, domainId: string) {
  try {
    // 1. SAFETY CHECK: Is it already recording?
    const activeEgresses = await egressClient.listEgress({ roomName });
    
    const isRecording = activeEgresses.some(
      (e) => e.status === 0 || e.status === 1 // 0=Starting, 1=Active
    );

    if (isRecording) {
      console.log("⚠️ Recording already in progress for", roomName);
      return;
    }

    // 2. DEFINE OUTPUT (v2 API) - REMOVE LEADING SLASH
    const output = new EncodedFileOutput({
      filepath: `subdomains/${domainId}/recordings/${roomName}/${Date.now()}.mp4`, // NO LEADING SLASH!
      output: {
        case: 's3',
        value: new S3Upload({
          accessKey: process.env.AWS_ACCESS_KEY_ID!,
          secret: process.env.AWS_SECRET_ACCESS_KEY!,
          region: process.env.AWS_REGION!,
          bucket: process.env.AWS_S3_BUCKET_NAME!,
        }),
      },
    });

    // 3. START RECORDING
    console.log("🚀 Starting Egress for", roomName);
    
    await egressClient.startRoomCompositeEgress(
      roomName,
      { file: output },
      {
        layout: "grid",
        encodingOptions: EncodingOptionsPreset.H264_1080P_30,
      }
    );

    console.log("✅ Recording Started");

  } catch (error) {
    console.error("❌ Failed to start recording:", error);
  }
}