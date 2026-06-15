export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const twilioNumber = searchParams.get("twilioNumber");

    if (!slug || !twilioNumber) {
      console.error("Missing params", { slug, twilioNumber });
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    const formData = await req.formData();
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const body = formData.get("Body") as string;
    const numMedia = parseInt((formData.get("NumMedia") as string) ?? "0", 10);

    const mediaUrls: string[] = [];
    const mediaContentTypes: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const url = formData.get(`MediaUrl${i}`) as string;
      const contentType = formData.get(`MediaContentType${i}`) as string;
      if (url) mediaUrls.push(url);
      if (contentType) mediaContentTypes.push(contentType);
    }

    console.log({ slug, twilioNumber, from, to, body, numMedia, mediaUrls, mediaContentTypes });

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  } catch (err) {
    console.error("Twilio webhook error:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }
}