export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const twilioNumber = searchParams.get("twilioNumber");

    if (!slug || !twilioNumber) {
      console.error("Missing params", { slug, twilioNumber });
      // Still return 200 — Twilio needs a 2xx or it will retry + log 11200
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    const formData = await req.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;

    console.log({ slug, twilioNumber, from, body });

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  } catch (err) {
    console.error("Twilio webhook error:", err);
    // Always return 200 to Twilio even on internal errors
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }
}