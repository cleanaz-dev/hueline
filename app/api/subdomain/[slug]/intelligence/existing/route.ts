import { prisma } from "@/lib/prisma";
import { createCallIntelligenceLog } from "@/lib/prisma/mutations/logs/create-intelligence-log";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. SECURITY CHECK
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key");

    if (apiKey !== process.env.INTERNAL_API_KEY) {
      console.warn("⛔ Unauthorized webhook attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. PARSE THE DATA
    const body = await req.json();
    const {
      call_sid,
      hueline_id,
      recording_url,
      duration,
      transcript_text,
      intelligence,
      status,
    } = body;

    // Validate
    if (!call_sid || !hueline_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`📞 Processing Call ${call_sid} for Booking ${hueline_id}`);

    const bookingData = await prisma.subBookingData.findFirst({
      where: {
        huelineId: hueline_id,
        AND: {
          calls: {
            some: {
              callSid: call_sid,
            },
          },
        },
      },
      select: {
        id: true,
        subdomainId: true,
      }
    });

    if(!bookingData) return NextResponse.json({message: "Invalid Request"}, {status: 400})

    // 3. THE TRANSACTION (Update History + Update Dashboard State)
    const result = await prisma.$transaction(async (tx) => {
      // --- STEP A: Save the Call History ---
      const savedCall = await tx.call.upsert({
        where: { callSid: call_sid },
        update: {
          audioUrl: recording_url,
          duration: String(duration),
          status: status,
          intelligence: {
            upsert: {
              create: {
                projectScope: intelligence.projectScope,
                callReason: intelligence.callReason,
                hiddenNeedsFound: intelligence.hiddenNeedsFound,
                surfacePrepNeeds: intelligence.surfacePrepNeeds,
                structuralNeeds: intelligence.structuralNeeds,
                technicalNeeds: intelligence.technicalNeeds,
                estimatedAdditionalValue: intelligence.estimatedAdditionalValue,
                callSummary: intelligence.callSummary || null,
                callOutcome: intelligence.callOutcome || null,
              },
              update: {
                projectScope: intelligence.projectScope,
                callReason: intelligence.callReason,
                hiddenNeedsFound: intelligence.hiddenNeedsFound,
                estimatedAdditionalValue: intelligence.estimatedAdditionalValue,
                callSummary: intelligence.callSummary || null,
                callOutcome: intelligence.callOutcome || null,
              },
            },
          },
        },
        create: {
          callSid: call_sid,
          audioUrl: recording_url,
          duration: String(duration),
          status: status,
          bookingData: { connect: { huelineId: hueline_id } },

          intelligence: {
            create: {
              projectScope: intelligence.projectScope,
              callReason: intelligence.callReason,
              hiddenNeedsFound: intelligence.hiddenNeedsFound,
              surfacePrepNeeds: intelligence.surfacePrepNeeds,
              structuralNeeds: intelligence.structuralNeeds,
              technicalNeeds: intelligence.technicalNeeds,
              estimatedAdditionalValue: intelligence.estimatedAdditionalValue,
              callSummary: intelligence.callSummary || null,
              callOutcome: intelligence.callOutcome || null,
            },
          },
        },
        include: { intelligence: true },
      });

      // --- STEP B: Update the Parent "Pulse" (For the Dashboard) ---

      // Logic: Only update the scope if the AI found a specific one.
      // We don't want to overwrite a known "INTERIOR" with "UNKNOWN".
      const scopeUpdate =
        intelligence.projectScope !== "UNKNOWN"
          ? { currentProjectScope: intelligence.projectScope }
          : {};

      await tx.subBookingData.update({
        where: { huelineId: hueline_id },
        data: {
          // 1. Update Status to the latest call & Project Type
          currentCallReason: intelligence.callReason,
          projectType: intelligence.propertyType,

          // 2. Bump this lead to the top of the list
          lastCallAt: new Date(),

          // 3. Update the "Play" button audio
          lastCallAudioUrl: recording_url,

          // 4. Update Scope (Conditionally)
          ...scopeUpdate,

          // 5. Optional: Append summary to notes if you want
          // summary: intelligence.callSummary || undefined
        },
      });

      await createCallIntelligenceLog({
        bookingDataId: bookingData.id,
        subdomainId: bookingData.subdomainId,
        callSid: call_sid,
        callReason: intelligence.callReason,
        projectScope: intelligence.projectScope,
        hiddenNeedsFound: intelligence.hiddenNeedsFound,
        surfacePrepNeeds: intelligence.surfacePrepNeeds,
        structuralNeeds: intelligence.structuralNeeds,
        technicalNeeds: intelligence.technicalNeeds,
        estimatedAdditionalValue: intelligence.estimatedAdditionalValue,
        recordingUrl: recording_url,
        duration: String(duration),
        callSummary: intelligence.callSummary || null,
        callOutcome: intelligence.callOutcome || null,
      });

      return savedCall;
    });

    console.log(
      `✅ Success! Updated Booking & Call. Scope: ${result.intelligence?.projectScope}, Outcome: ${result.intelligence?.callOutcome}`
    );

    return NextResponse.json({ success: true, id: result.id }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}