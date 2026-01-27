import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { generatePin } from "@/lib/utils/id-generator";
import { z } from "zod";
// import { sendShareProjectEmail } from "@/lib/resend/services";
import { sendShareProjectEmail } from "@/lib/send-grid";
import { upsertSharedAccess } from "@/lib/prisma/mutations";
import { generateSharedLink } from "@/lib/utils/shared-link-generator";
import { createSharedProjectLog } from "@/lib/prisma/mutations/logs/create-share-project-log";

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
    // 1. AUTH CHECK
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = session.role === 'SUPER_ADMIN';
    const isSubdomainOwner = session.user?.subdomainSlug === slug && session.role !== 'customer';
    const isBookingOwner = 
      session.role === 'customer' && 
      session.user?.huelineId === huelineId && 
      session.user?.accessLevel === 'owner';

    if (!isSuperAdmin && !isSubdomainOwner && !isBookingOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate Body
    const body = await req.json();
    const result = shareSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request", details: result.error }, { status: 400 });
    }

    const { emails, accessType } = result.data;
    const results = [];

    // 3. Process Loop
    for (const email of emails) {
      const pin = generatePin(); 
      const accessRecord = await upsertSharedAccess(huelineId, email, accessType, pin);
      const shareUrl = generateSharedLink(slug, huelineId);

      await sendShareProjectEmail({
        email: email,
        url: shareUrl,
        pin: pin,
        accessType: accessType
      });

      results.push(accessRecord);
    }

    // 4. DETERMINE ACTOR
    // Based on your auth config: 'customer' = CLIENT, anything else (ADMIN/MEMBER) = PAINTER
    const actor = session.role === 'customer' ? 'CLIENT' : 'PAINTER';

    // 5. LOG IT
    await createSharedProjectLog({
      huelineId,
      slug,
      recipients: emails,
      accessType,
      actor: actor
    });

    console.log(`✅ Shared ${huelineId} with ${emails.length} people. Actor: ${actor}`);

    return NextResponse.json({ success: true, sharedWith: results });

  } catch (error) {
    console.error("❌ Share Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}