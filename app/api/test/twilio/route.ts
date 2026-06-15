export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);

  const slug = searchParams.get("slug");
  const twilioNumber = searchParams.get("twilioNumber");

  if (!slug || !twilioNumber) {
    return new Response("Missing required params: slug and twilioNumber", {
      status: 400,
    });
  }

  // Parse the Twilio webhook form body
  const formData = await req.formData();
  const from = formData.get("From") as string;
  const body = formData.get("Body") as string;

  console.log({ slug, twilioNumber, from, body });

  // Return a TwiML response (even empty, Twilio expects this)
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}