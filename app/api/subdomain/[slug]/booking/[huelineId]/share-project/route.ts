import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config"; // Ensure correct path
import { generatePin } from "@/lib/utils/id-generator"; // Ensure correct path
import { z } from "zod";
import { sendShareProjectEmail } from "@/lib/resend/services";
import { upsertSharedAccess } from "@/lib/prisma/mutations";
import { generateSharedLink } from "@/lib/utils/shared-link-generator";

interface Params {
  params: Promise<{
    huelineId: string;
    slug: string;
  }>;
}

const shareSchema = z.object({
  emails: z.array(z.email()).min(1),
  accessType: z.enum(["customer", "viewer"]),
});

export async function POST(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;

  try {
    // 1. 🔒 AUTH CHECK
    // Only the Account Owner (SaaS User) or Super Admin can share
    const session = await getServerSession(authOptions);
    
    const isOwner = session?.user?.subdomainSlug === slug;
    const isSuperAdmin = session?.role === 'SUPER_ADMIN';

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate Body
    const body = await req.json();
    const result = shareSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error },
        { status: 400 }
      );
    }

    const { emails, accessType } = result.data;
    const results = [];

    // 3. Process Loop
    for (const email of emails) {
      const pin = generatePin(); // Generate 4-digit PIN

      // A. Update DB (Upsert)
      const accessRecord = await upsertSharedAccess(huelineId, email, accessType, pin);
      
      const shareUrl = generateSharedLink(slug,huelineId)

      // C. Send Email
      await sendShareProjectEmail({
        email: email,
        url: shareUrl,
        pin: pin,
        accessType: accessType
      });

      results.push(accessRecord);
    }

    console.log(`✅ Shared ${huelineId} with ${emails.length} people.`);

    return NextResponse.json({ success: true, sharedWith: results });

  } catch (error) {
    console.error("❌ Share Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}