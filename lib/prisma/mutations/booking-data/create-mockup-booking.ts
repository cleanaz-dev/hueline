import { prisma } from "../../config";

interface MockupUrl {
  s3_key:    string;
  room_type: string;
}

interface CreateMockupBookingPayload {
  huelineId:      string;
  subdomainId:    string;
  slug:           string;
  name:           string;
  phone:          string;
  roomType:       string;
  prompt:         string;
  originalImages: string;
  mockupUrls:     MockupUrl[];
  colorBrand:     string;
  colorName:      string;
  colorCode:      string;
  colorHex:       string;
  summary:        string;
  callDuration:   string;
  dimensions:     string;
  dateTime:       string;
  pin:            string;
  callSid:        string;
}

export async function createMockupBooking(payload: CreateMockupBookingPayload) {
  const {
    huelineId,
    subdomainId,
    name,
    phone,
    roomType,
    prompt,
    originalImages,
    mockupUrls,
    colorBrand,
    colorName,
    colorCode,
    colorHex,
    summary,
    dimensions,
    dateTime,
    pin,
  } = payload;

  console.log("Creating Mockup Booking for:", payload);

  const expiresAt = Math.floor(Date.now() / 1000) + 259200;

  const mockupData = mockupUrls.map((mockup) => ({
    s3Key:    mockup.s3_key,
    roomType: mockup.room_type,
    brand:    colorBrand,
    code:     colorCode,
    name:     colorName,
    hex:      colorHex,
  }));

  const paintColorData = [{
    brand: colorBrand,
    code:  colorCode,
    name:  colorName,
    hex:   colorHex,
  }];

  const booking = await prisma.subBookingData.upsert({
    where: { huelineId },
    update: {
      name,
      phone,
      roomType,
      prompt,
      originalImages,
      summary,
      dimensions,
      dateTime: new Date(dateTime),
      pin,
      mockups:     { deleteMany: {}, create: mockupData },
      paintColors: { deleteMany: {}, create: paintColorData },
    },
    create: {
      huelineId,
      subdomain:     { connect: { id: subdomainId } },
      name,
      phone,
      roomType,
      prompt,
      originalImages,
      summary,
      dimensions,
      dateTime: new Date(dateTime),
      pin,
      expiresAt,
      initialIntent: "NEW_PROJECT",
      mockups:     { create: mockupData },
      paintColors: { create: paintColorData },
    },
  });

  return { booking };
}