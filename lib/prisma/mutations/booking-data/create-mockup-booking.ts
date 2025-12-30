//lib/prisma/mutations/booking-data/create-mockup-booking.ts
import { prisma } from "../../config";


interface MockupUrl {
  s3_key: string;
  room_type: string;
  color: {
    ral: string;
    hex: string;
    name: string;
  };
  presigned_url: string;
}

interface PaintColor {
  ral: string;
  hex: string;
  name: string;
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
  pin: string 
  call_sid: string;
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


  // Calculate expires at (3 days from now in seconds)
  const expiresAt = Math.floor(Date.now() / 1000) + 259200;

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
      pin: pin,
      // Update mockups (delete old ones and create new)
      mockups: {
        deleteMany: {},
        create: mockup_urls.map((mockup) => ({
          s3Key: mockup.s3_key,
          roomType: mockup.room_type,
          presignedUrl: mockup.presigned_url,
          colorRal: mockup.color.ral,
          colorName: mockup.color.name,
          colorHex: mockup.color.hex,
        })),
      },
      // Update paint colors
      paintColors: {
        deleteMany: {},
        create: paint_colors.map((color) => ({
          ral: color.ral,
          name: color.name,
          hex: color.hex,
        })),
      },
    },
    create: {
      huelineId: hueline_id,
      subdomain: {
        connect: { id: subdomain_id },
      },
      name,
      phone,
      roomType: room_type,
      prompt,
      originalImages: original_images,
      summary,
      dimensions,
      dateTime: new Date(date_time),
      pin: pin,
      expiresAt,
      initialIntent: "NEW_PROJECT",
      mockups: {
        create: mockup_urls.map((mockup) => ({
          s3Key: mockup.s3_key,
          roomType: mockup.room_type,
          presignedUrl: mockup.presigned_url,
          colorRal: mockup.color.ral,
          colorName: mockup.color.name,
          colorHex: mockup.color.hex,
        })),
      },
      paintColors: {
        create: paint_colors.map((color) => ({
          ral: color.ral,
          name: color.name,
          hex: color.hex,
        })),
      },
    },
  });

  return { booking };
}