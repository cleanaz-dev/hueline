import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. SECURITY CHECK (The Guard at the Gate)
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key");

    if (apiKey !== process.env.INTERNAL_API_KEY) {
      console.warn("⛔ Unauthorized webhook attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. PARSE THE DATA (The Payload)
    const body = await req.json();
    const { 
      call_sid,
      hueline_id, 
      domain_id, 
      recording_url, 
      duration,
      transcript_text,
      intelligence, // <--- This contains the gold (Scope, Needs, $$$)
      status
    } = body;

    // Validate essential data
    if (!call_sid || !hueline_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`📞 Processing webhook for Call ${call_sid} (Booking: ${hueline_id})`);
    console.log("🔥🔥🔥 Intelligence:", intelligence)

    // 3. DB WRITE: UPSERT (Create or Update)
    // We use 'upsert' so if the Lambda fires twice by accident, we just update it instead of crashing.
    const savedCall = await prisma.call.upsert({
      where: { 
        callSid: call_sid 
      },
      // SCENARIO A: UPDATE (Call exists, maybe we are refining the AI data)
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
            },
            update: {
              projectScope: intelligence.projectScope,
              callReason: intelligence.callReason,
              hiddenNeedsFound: intelligence.hiddenNeedsFound,
              estimatedAdditionalValue: intelligence.estimatedAdditionalValue,
            }
          }
        }
      },
      // SCENARIO B: CREATE (New Call)
      create: {
        callSid: call_sid,
        audioUrl: recording_url,
        duration: String(duration),
        status: status,
        // Connect to the parent Booking via HuelineID
        bookingData: {
          connect: { huelineId: hueline_id }
        },
        // Create the AI Intelligence Record immediately
        intelligence: {
          create: {
            projectScope: intelligence.projectScope,
            callReason: intelligence.callReason,
            hiddenNeedsFound: intelligence.hiddenNeedsFound,
            surfacePrepNeeds: intelligence.surfacePrepNeeds,
            structuralNeeds: intelligence.structuralNeeds,
            technicalNeeds: intelligence.technicalNeeds,
            estimatedAdditionalValue: intelligence.estimatedAdditionalValue,
          }
        }
      },
      include: {
        intelligence: true // Return the AI data to confirm it worked
      }
    });

    // 4. OPTIONAL: Update the Parent Booking with the Summary?
    // If you want the 'summary' visible on the main booking card:
    if (intelligence.summary || transcript_text) {
        await prisma.subBookingData.update({
            where: { huelineId: hueline_id },
            data: {
                // You might want to append to notes, or update a 'lastCallSummary' field
                summary: intelligence.summary || undefined
            }
        }).catch(err => console.error("Could not update parent booking summary", err));
    }

    console.log(`✅ Success! Intelligence saved: ${savedCall.intelligence?.projectScope} - $${savedCall.intelligence?.estimatedAdditionalValue}`);

    return NextResponse.json({ success: true, id: savedCall.id }, { status: 200 });

  } catch (error) {
    console.error("❌ Webhook Error:", error);
    // Don't leak DB errors to the outside world
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}