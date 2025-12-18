import { prisma } from "../../config";

export async function saveCall(
  hueline_id: string,
  subdomain_id: string | null,
  slug: string | null,
  pin: string,
  name: string,
  phone: string,
  room_type: string,
  prompt: string,
  original_images: string,
  summary: string,
  dimensions: string,
  date_time: string,
  call_sid: string,
  call_duration: string,
  mockup_urls: { s3_key: string, room_type: string, presigned_url: string, color: { ral: string, name: string, hex: string } }[],
  paint_colors: { ral: string, name: string, hex: string }[]
) {
  let subdomainId = subdomain_id;

  if (!subdomainId && slug) {
    const sub = await prisma.subdomain.findUnique({
      where: { slug: slug },
    });
    if (sub) subdomainId = sub.id;
  }

  if (!subdomainId) {
    throw new Error("Invalid Subdomain ID or Slug");
  }

  const booking = await prisma.subBookingData.upsert({
    where: { huelineId: hueline_id },
    update: {
      pin: pin,
      name: name,
      phone: phone || "No Phone",
      roomType: room_type,
      prompt: prompt,
      originalImages: original_images,
      summary: summary,
      dimensions: dimensions,
      dateTime: new Date(date_time),

      calls: {
        create: {
          callSid: call_sid,
          duration: call_duration,
        },
      },

      mockups: {
        create: mockup_urls.map((m) => ({
          s3Key: m.s3_key,
          roomType: m.room_type,
          presignedUrl: m.presigned_url,
          colorRal: m.color.ral,
          colorName: m.color.name,
          colorHex: m.color.hex,
        })),
      },

      paintColors: {
        create: paint_colors.map((c) => ({
          ral: c.ral,
          name: c.name,
          hex: c.hex,
        })),
      },
    },
    create: {
      huelineId: hueline_id,
      subdomainId: subdomainId,

      name: name,
      phone: phone || "No Phone",
      roomType: room_type,
      prompt: prompt,
      originalImages: original_images,
      summary: summary,
      dimensions: dimensions,
      dateTime: new Date(date_time),
      pin: pin,
      expiresAt: Math.floor(Date.now() / 1000) + 72 * 60 * 60,

      calls: {
        create: {
          callSid: call_sid,
          duration: call_duration,
        },
      },

      mockups: {
        create: mockup_urls.map((m) => ({
          s3Key: m.s3_key,
          roomType: m.room_type,
          presignedUrl: m.presigned_url,
          colorRal: m.color.ral,
          colorName: m.color.name,
          colorHex: m.color.hex,
        })),
      },

      paintColors: {
        create: paint_colors.map((c) => ({
          ral: c.ral,
          name: c.name,
          hex: c.hex,
        })),
      },
    },
  });

  return {
    success: true,
    id: booking.id,
    pin: booking.pin,
  };
}