import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; callSid: string }> }
) {
  const { slug, callSid } = await params;

  if (!slug || !callSid)
    return NextResponse.json(
      { message: "Missing Parameters" },
      { status: 400 }
    );

  // 1. SECURITY CHECK
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      intelligence, 
      transcript_text, 
      recording_url,
      duration,
      huelineId,  // This may or may not exist
      domain_id 
    } = body;

    console.log(`💾 Saving Intelligence for Call: ${callSid}`);

    // 2. GET SUBDOMAIN (for validation)
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug }
    });

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain not found" },
        { status: 404 }
      );
    }

    // 3. ATTEMPT TO FIND BOOKING (Two strategies)
    let bookingDataId: string | null = null;

    // Strategy A: Direct match by huelineId (if provided)
    if (huelineId) {
      console.log(`🔍 Looking for booking with huelineId: ${huelineId}`);
      const booking = await prisma.subBookingData.findUnique({
        where: { huelineId }
      });

      if (booking) {
        bookingDataId = booking.id;
        console.log(`✅ Found booking via huelineId: ${bookingDataId}`);
      } else {
        console.log(`⚠️ No booking found for huelineId: ${huelineId}`);
      }
    }

    // Strategy B: Fallback to phone number match (if no huelineId or not found)
    if (!bookingDataId) {
      console.log(`🔍 Attempting to find booking via call record...`);
      
      // First check if call exists and has phone number
      const existingCall = await prisma.call.findUnique({
        where: { callSid },
        select: { 
          bookingDataId: true,
          // If you store phone number on Call model, include it here
          // phoneNumber: true 
        }
      });

      // If call already has a booking linked, use it
      if (existingCall?.bookingDataId) {
        bookingDataId = existingCall.bookingDataId;
        console.log(`✅ Call already linked to booking: ${bookingDataId}`);
      }
    }

    // 4. UPSERT CALL WITH INTELLIGENCE
   const updatedCall = await prisma.call.upsert({
      where: { callSid },
      
      update: {
        audioUrl: recording_url,
        duration: duration ? String(duration) : undefined,
        status: "completed",
        ...(bookingDataId && { bookingDataId }),
        
        intelligence: {
          upsert: {
            create: {
              transcriptText: transcript_text,
              callReason: intelligence.callReason || "OTHER",
              projectScope: intelligence.projectScope,
              estimatedAdditionalValue: intelligence.estimatedAdditionalValue || 0,
              
              // ✅ ADD THESE LINES
              callSummary: intelligence.callSummary || null, 
              callOutcome: intelligence.callOutcome || null, 
              
              customFields: intelligence,
            },
            update: {
              transcriptText: transcript_text,
              callReason: intelligence.callReason || "OTHER",
              projectScope: intelligence.projectScope,
              estimatedAdditionalValue: intelligence.estimatedAdditionalValue || 0,
              
              // ✅ ADD THESE LINES
              callSummary: intelligence.callSummary || null,
              callOutcome: intelligence.callOutcome || null,
              
              customFields: intelligence,
            },
          },
        },
      },
      
      create: {
        callSid,
        audioUrl: recording_url || "",
        duration: duration ? String(duration) : "0",
        status: "completed",
        bookingDataId: bookingDataId,
        
        intelligence: {
          create: {
            transcriptText: transcript_text,
            callReason: intelligence.callReason || "OTHER",
            projectScope: intelligence.projectScope,
            estimatedAdditionalValue: intelligence.estimatedAdditionalValue || 0,
            
            // ✅ ADD THESE LINES
            callSummary: intelligence.callSummary || null,
            callOutcome: intelligence.callOutcome || null,
            
            customFields: intelligence,
          },
        },
      },
      
      include: {
        bookingData: {
          select: {
            id: true,
            huelineId: true,
            name: true,
          }
        }
      }
    });

    // 5. LOG RESULT
    if (updatedCall.bookingData) {
      console.log(`✅ Call linked to booking: ${updatedCall.bookingData.huelineId}`);
    } else {
      console.log(`⚠️ Call saved without booking link (unidentified caller)`);
    }

    return NextResponse.json({ 
      success: true, 
      callId: updatedCall.id,
      linked: !!updatedCall.bookingData,
      bookingId: updatedCall.bookingData?.huelineId || null
    });

  } catch (error) {
    console.error("❌ Error saving intelligence:", error);
    
    // Return 200 to prevent Lambda infinite retry
    // But log the actual error for debugging
    return NextResponse.json(
      { 
        error: "Failed to save",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 200 }
    );
  }
}
