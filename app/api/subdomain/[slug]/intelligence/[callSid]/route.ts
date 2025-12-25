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
      huelineId,
      // domain_id // Unused?
    } = body;

    console.log(`💾 Saving Intelligence for Call: ${callSid}`);

    // ---------------------------------------------------------
    // ✅ PRE-PROCESSING: Extract & Filter
    // ---------------------------------------------------------
    const {
      callReason,
      projectScope,
      estimatedAdditionalValue,
      callSummary,
      callOutcome,
      // We extract the new "Pulse" field here (assuming AI sends it)
      short_headline, 
      ...filteredCustomFields 
    } = intelligence || {};

    // 2. GET SUBDOMAIN (Validation)
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug }
    });

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain not found" },
        { status: 404 }
      );
    }

    // 3. FIND BOOKING (Strategy A: huelineId, Strategy B: Existing Link)
    let bookingDataId: string | null = null;

    if (huelineId) {
      const booking = await prisma.subBookingData.findUnique({
        where: { huelineId }
      });
      if (booking) bookingDataId = booking.id;
    }

    if (!bookingDataId) {
      const existingCall = await prisma.call.findUnique({
        where: { callSid },
        select: { bookingDataId: true }
      });
      if (existingCall?.bookingDataId) {
        bookingDataId = existingCall.bookingDataId;
      }
    }

    // 4. UPSERT CALL
    // We strictly log what happened in THIS specific call here
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
              callReason: callReason || "OTHER",
              projectScope: projectScope,
              estimatedAdditionalValue: estimatedAdditionalValue || 0,
              callSummary: callSummary || null,
              callOutcome: callOutcome || null,
              customFields: filteredCustomFields,
            },
            update: {
              transcriptText: transcript_text,
              callReason: callReason || "OTHER",
              projectScope: projectScope,
              estimatedAdditionalValue: estimatedAdditionalValue || 0,
              callSummary: callSummary || null,
              callOutcome: callOutcome || null,
              customFields: filteredCustomFields,
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
            callReason: callReason || "OTHER",
            projectScope: projectScope,
            estimatedAdditionalValue: estimatedAdditionalValue || 0,
            callSummary: callSummary || null,
            callOutcome: callOutcome || null,
            customFields: filteredCustomFields,
          },
        },
      },
      include: {
        bookingData: { select: { huelineId: true } }
      }
    });

    // 5. UPDATE SUBBOOKING DATA (The Perfect Sauce)
    if (bookingDataId) {
      console.log(`🔄 Updating SubBookingData for ID: ${bookingDataId}`);
      
      const additionalValue = Number(estimatedAdditionalValue) || 0;

      // A. FETCH CURRENT STATE (Required for Accumulation Logic)
      const existingBooking = await prisma.subBookingData.findUnique({
        where: { id: bookingDataId },
        select: { 
          estimatedValue: true, 
          projectType: true,
          projectScope: true // Now an Array
        }
      });

      // B. CALCULATE UPDATES

      // 1. Math (Cumulative)
      const currentTotal = Number(existingBooking?.estimatedValue) || 0;
      const newTotal = currentTotal + additionalValue;

      // 2. Project Type (Sticky - Don't overwrite known with unknown)
      let newProjectType = existingBooking?.projectType;
      if (intelligence.propertyType && intelligence.propertyType !== "UNKNOWN") {
        newProjectType = intelligence.propertyType;
      }

      // 3. Project Scope (Accumulative Array)
      const incomingScope = projectScope; 
      // Ensure we have an array to start with
      const currentScopes = existingBooking?.projectScope || [];
      const newScopes = [...currentScopes];

      // Only add if it's valid, not unknown, and not already in the list
      if (incomingScope && incomingScope !== "UNKNOWN" && !newScopes.includes(incomingScope)) {
        newScopes.push(incomingScope);
      }

      // 4. Last Interaction (The "Pulse" Headline)
      let pulseString = "Interaction Logged";
      
      if (short_headline) {
        pulseString = short_headline;
      } else if (callReason && callReason !== "UNKNOWN") {
        // Fallback: Formats "NEW_PROJECT" -> "New Project"
        pulseString = callReason.replace(/_/g, " ").toLowerCase();
        pulseString = pulseString.charAt(0).toUpperCase() + pulseString.slice(1);
      }

      // C. PERFORM UPDATE
      await prisma.subBookingData.update({
        where: { id: bookingDataId },
        data: {
          // --- SNAPSHOT FIELDS (Latest Info) ---
          lastCallAt: new Date(),
          lastCallAudioUrl: recording_url,
          lastInteraction: pulseString, // The readable dashboard headline
          lastCallReason: (callReason && callReason !== "UNKNOWN") ? callReason : undefined,

          // --- STICKY / ACCUMULATIVE FIELDS ---
          estimatedValue: newTotal,
          projectType: newProjectType,
          projectScope: newScopes, // Saves the accumulated array
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      callId: updatedCall.id,
      linked: !!updatedCall.bookingData,
      bookingId: updatedCall.bookingData?.huelineId || null
    });

  } catch (error) {
    console.error("❌ Error saving intelligence:", error);
    return NextResponse.json(
      { error: "Failed to save", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 200 }
    );
  }
}