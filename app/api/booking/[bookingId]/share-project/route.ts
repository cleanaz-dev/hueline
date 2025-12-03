import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePin } from "@/lib/utils";
import { z } from "zod";
import { getBooking, setBooking } from "@/lib/redis";
import { sendShareProjectEmail } from "@/lib/resend/services";

interface Params {
  params: Promise<{
    bookingId: string;
  }>;
}

interface SharedAccess {
  email: string;
  accessType: "customer" | "viewer";
  pin: string;
  createdAt: string;
  updatedAt?: string;
}

const shareSchema = z.object({
  emails: z.array(z.string().email()).min(1),
  accessType: z.enum(["customer", "viewer"]),
});

export async function POST(req: Request, { params }: Params) {
  const { bookingId } = await params;

  console.log("📧 Share booking request received for:", bookingId);

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin or the booking's customer can share
    if (session.role !== "admin" && session.user.id !== bookingId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    console.log("📝 Request body:", body);

    const result = shareSchema.safeParse(body);

    if (!result.success) {
      console.error("❌ Validation failed:", result.error);
      return NextResponse.json(
        { error: "Invalid request", details: result.error },
        { status: 400 }
      );
    }

    const { emails, accessType } = result.data;
    const booking = await getBooking(bookingId);

    if (!booking) {
      console.error("❌ Booking not found:", bookingId);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.sharedAccess) {
      booking.sharedAccess = [];
    }

    const newShares: SharedAccess[] = [];

    for (const email of emails) {
      const existingAccess = booking.sharedAccess.find(
        (access: SharedAccess) => access.email === email
      );

      if (existingAccess) {
        console.log(`🔄 Updating existing access for: ${email}`);
        existingAccess.accessType = accessType;
        existingAccess.updatedAt = new Date().toISOString();
      } else {
        console.log(`➕ Creating new access for: ${email}`);
        const newAccess: SharedAccess = {
          email,
          accessType,
          pin: generatePin(),
          createdAt: new Date().toISOString(),
        };
        booking.sharedAccess.push(newAccess);
        newShares.push(newAccess);
      }
    }

    await setBooking(bookingId, booking);
    console.log("✅ Booking updated in Redis");
    console.log("📬 New shares to email:", newShares.length);

    for (const share of newShares) {
      console.log(`📧 Sending email to: ${share.email} with PIN: ${share.pin}`);
      try {
        await sendShareProjectEmail({
          email: share.email,
          accessType: share.accessType,
          pin: share.pin,
          bookingId: bookingId,
        });
        console.log(`✅ Email sent successfully to: ${share.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${share.email}:`, emailError);
      }
    }

    console.log("✅ Process completed");

    return NextResponse.json(
      {
        message: "Access shared successfully",
        sharedCount: emails.length,
        newSharesCount: newShares.length,
        updatedSharesCount: emails.length - newShares.length,
        emailsSent: newShares.length > 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error sharing booking:", error);
    return NextResponse.json(
      { error: "Failed to share booking" },
      { status: 500 }
    );
  }
}
