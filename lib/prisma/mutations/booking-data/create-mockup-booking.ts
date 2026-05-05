import { prisma } from "../../config";

interface MockupColor {
  ral: string;
  hex: string;
  name: string;
  brand?: string;
  code?: string;
}

interface MockupUrl {
  s3_key: string;
  room_type: string;
  color: MockupColor;
  presigned_url: string;
}

interface PaintColor {
  ral: string;
  hex: string;
  name: string;
  brand?: string;
  code?: string;
}

interface CreateMockupBookingPayload {
  hueline_id: string;
  subdomain_id: string;
  slug: string;
  name: string;
  phone: string;
  room_type: string;
  prompt: string;
  original_images: string;
  mockup_urls: MockupUrl[];
  paint_colors: PaintColor[];
  summary: string;
  call_duration: string;
  alternate_colors: PaintColor[];
  dimensions: string;
  date_time: string;
  pin: string;
  call_sid: string;
}

async function fetchS3Metadata(presignedUrl: string) {
  const res = await fetch(presignedUrl, { method: 'HEAD' });
  return {
    mimeType: res.headers.get('content-type') ?? 'image/jpeg',
    size: parseInt(res.headers.get('content-length') ?? '0'),
  };
}

function parseColorCode(color: MockupColor | PaintColor) {
  return {
    brand: color.brand ?? 'RAL',
    code: color.code ?? color.ral.replace(/^RAL\s*/i, '').trim(),
  }
}

export async function createMockupBooking(payload: CreateMockupBookingPayload) {
  const {
    hueline_id,
    subdomain_id,
    name,
    phone,
    room_type,
    prompt,
    original_images,
    mockup_urls,
    paint_colors,
    summary,
    dimensions,
    date_time,
    pin,
  } = payload;

  console.log("Creating Mockup Booking for:", payload);

  const expiresAt = Math.floor(Date.now() / 1000) + 259200;

  const mockupData = mockup_urls.map((mockup) => ({
    s3Key: mockup.s3_key,
    roomType: mockup.room_type,
    presignedUrl: mockup.presigned_url,
    name: mockup.color.name,
    hex: mockup.color.hex,
    ...parseColorCode(mockup.color),
  }));

  const paintColorData = paint_colors.map((color) => ({
    name: color.name,
    hex: color.hex,
    ...parseColorCode(color),
  }));

  const booking = await prisma.subBookingData.upsert({
    where: { huelineId: hueline_id },
    update: {
      name,
      phone,
      roomType: room_type,
      prompt,
      originalImages: original_images,
      summary,
      dimensions,
      dateTime: new Date(date_time),
      pin,
      mockups: {
        deleteMany: {},
        create: mockupData,
      },
      paintColors: {
        deleteMany: {},
        create: paintColorData,
      },
    },
    create: {
      huelineId: hueline_id,
      subdomain: { connect: { id: subdomain_id } },
      name,
      phone,
      roomType: room_type,
      prompt,
      originalImages: original_images,
      summary,
      dimensions,
      dateTime: new Date(date_time),
      pin,
      expiresAt,
      initialIntent: "NEW_PROJECT",
      mockups: { create: mockupData },
      paintColors: { create: paintColorData },
    },
  });

  const mediaAttachments = await Promise.all(
    mockup_urls.map(async (mockup) => {
      const { mimeType, size } = await fetchS3Metadata(mockup.presigned_url);
      return {
        filename: mockup.s3_key.split('/').pop() ?? mockup.s3_key,
        mimeType,
        size,
        mediaSource: 'S3' as const,
        mediaUrl: mockup.s3_key,
      };
    })
  );

  await prisma.demoClient.create({
    data: {
      name,
      phone,
      status: "PENDING",
      communication: {
        create: {
          body: "Prospect Generated Full Demo",
          role: "CLIENT",
          type: "DEMO",
          mediaAttachments: { create: mediaAttachments },
        },
      },
      subBookingData: { connect: { id: booking.id } },
      subdomain: { connect: { id: booking.subdomainId } },
    },
  });

  return { booking };
}