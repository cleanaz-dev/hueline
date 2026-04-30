export const MOCK_PROSPECTS = [
  {
    id: "1",
    name: "John Smith",
    phone: "+15551234567",
    email: "john@example.com",
    status: "BOOKED",
    createdAt: new Date(Date.now() - 86400000 * 6),
    subBookingData: { huelineId: "cal_123", time: "2026-05-02T14:00:00Z" },

    communication: [
      // SMS
      {
        id: "c1",
        body: "Hi John 👋 this is the AI assistant. Are you still looking for interior painting services?",
        role: "AI",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        id: "c2",
        body: "Yes, I need my living room and hallway done.",
        role: "CLIENT",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 5 + 60000),
      },
      {
        id: "c3",
        body: "Perfect — I can book you a quick estimate call or on-site visit.",
        role: "AI",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 5 + 120000),
      },
      {
        id: "c4",
        body: "Let's do an estimate call first.",
        role: "CLIENT",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 5 + 180000),
      },
      // EMAIL
      {
        id: "c5",
        body: "Booked 👍 Friday 2PM confirmed. Calendar invite sent.",
        role: "AI",
        type: "EMAIL",
        createdAt: new Date(Date.now() - 86400000 * 4),
      },
      // PHONE
      {
        id: "c6",
        body: "On-site technician check-in logged.",
        role: "OPERATOR",
        type: "PHONE",
        createdAt: new Date(Date.now() - 1800000),
      },
      // DEMO
      {
        id: "c7",
        body: "Virtual paint finish demo shared — client selected Eggshell White after viewing side-by-side samples.",
        role: "OPERATOR",
        type: "DEMO",
        mediaAttachments: [
          {
            id: "a1",
            filename: "paint-finish-demo.jpg",
            mimeType: "image/jpeg",
            size: 102400,
            mediaSource: "EXTERNAL",
            mediaUrl: "https://placehold.co/600x400?text=Paint+Finish+Demo",
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      // MEETING
      {
        id: "c8",
        body: "On-site walkthrough completed. Reviewed wall condition, confirmed colour selection. Client signed scope of work.",
        role: "OPERATOR",
        type: "MEETING",
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
    ],
  },

  {
    id: "2",
    name: "Sarah Miller",
    phone: "+15559876543",
    email: "sarah@outlook.com",
    status: "LEAD",
    createdAt: new Date(Date.now() - 86400000 * 2),

    communication: [
      // SMS
      {
        id: "c9",
        body: "Hi! I'm looking for a quote for a 2-bedroom apartment repaint.",
        role: "CLIENT",
        type: "SMS",
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        id: "c10",
        body: "Got it 👍 Do you want standard repaint or premium finish?",
        role: "AI",
        type: "SMS",
        createdAt: new Date(Date.now() - 7100000),
      },
      {
        id: "c11",
        body: "What's the difference?",
        role: "CLIENT",
        type: "SMS",
        mediaAttachments: [
          {
            id: "a2",
            filename: "room-photo.jpg",
            mimeType: "image/jpeg",
            size: 204800,
            mediaSource: "EXTERNAL",
            mediaUrl: "https://placehold.co/600x400?text=Room+Photo",
          },
        ],
        createdAt: new Date(Date.now() - 7000000),
      },
      {
        id: "c12",
        body: "Premium includes wall prep, minor repairs, and higher durability paint.",
        role: "AI",
        type: "SMS",
        createdAt: new Date(Date.now() - 6900000),
      },
      {
        id: "c13",
        body: "Yes please — I want to see pricing options.",
        role: "CLIENT",
        type: "SMS",
        createdAt: new Date(Date.now() - 600000),
      },
      // EMAIL
      {
        id: "c14",
        body: "We can schedule a demo walkthrough if you'd like a precise quote.",
        role: "AI",
        type: "EMAIL",
        createdAt: new Date(Date.now() - 6800000),
      },
      // PHONE
      {
        id: "c15",
        body: "Outbound call placed — left voicemail with pricing overview and next steps.",
        role: "OPERATOR",
        type: "PHONE",
        createdAt: new Date(Date.now() - 3600000),
      },
      // DEMO
      {
        id: "c16",
        body: "Virtual demo completed. Showed standard vs premium finish on sample walls. Sarah leaning towards premium.",
        role: "OPERATOR",
        type: "DEMO",
        createdAt: new Date(Date.now() - 1800000),
      },
      // MEETING
      {
        id: "c17",
        body: "In-person meeting scheduled for Monday to walk through the apartment and finalise quote.",
        role: "AI",
        type: "MEETING",
        createdAt: new Date(Date.now() - 900000),
      },
    ],
  },

  {
    id: "3",
    name: "David Chen",
    phone: "+15557654321",
    email: "david.chen@gmail.com",
    status: "LOST",
    createdAt: new Date(Date.now() - 86400000 * 10),

    communication: [
      // SMS
      {
        id: "c18",
        body: "Hey David, following up on your kitchen repaint inquiry.",
        role: "AI",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 9),
      },
      {
        id: "c19",
        body: "I found another contractor, thanks.",
        role: "CLIENT",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 9 + 120000),
      },
      {
        id: "c20",
        body: "Totally understand — if anything changes, we're here 👍",
        role: "AI",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 9 + 240000),
      },
      // PHONE
      {
        id: "c21",
        body: "Lead marked as lost due to competitor pricing.",
        role: "OPERATOR",
        type: "PHONE",
        createdAt: new Date(Date.now() - 86400000 * 8),
      },
      // EMAIL
      {
        id: "c22",
        body: "Sorry to hear we couldn't work together this time, David. Here's a 10% discount code for any future inquiry.",
        role: "AI",
        type: "EMAIL",
        createdAt: new Date(Date.now() - 86400000 * 7),
      },
      // DEMO
      {
        id: "c23",
        body: "Early-stage demo of kitchen colour options shared before lead went cold. No feedback received.",
        role: "OPERATOR",
        type: "DEMO",
        createdAt: new Date(Date.now() - 86400000 * 9 - 3600000),
      },
      // MEETING
      {
        id: "c24",
        body: "Brief in-person consultation at property. David mentioned budget concerns — competitor offered a lower flat rate.",
        role: "OPERATOR",
        type: "MEETING",
        createdAt: new Date(Date.now() - 86400000 * 9 - 7200000),
      },
    ],
  },

  {
    id: "4",
    name: "Emily Rodriguez",
    phone: "+15553456789",
    email: "emily@gmail.com",
    status: "WON",
    createdAt: new Date(Date.now() - 86400000 * 12),
    subBookingData: { huelineId: "cal_999", completed: true },

    communication: [
      // SMS
      {
        id: "c25",
        body: "I need a full apartment repaint ASAP.",
        role: "CLIENT",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 11),
      },
      {
        id: "c26",
        body: "We can do a same-week slot. Want a fast-track booking?",
        role: "AI",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 11 + 60000),
      },
      {
        id: "c27",
        body: "Yes I need it done before Friday.",
        role: "CLIENT",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 11 + 120000),
      },
      {
        id: "c28",
        body: "Thank you so much — looks amazing!",
        role: "CLIENT",
        type: "SMS",
        createdAt: new Date(Date.now() - 86400000 * 9 + 300000),
      },
      // PHONE
      {
        id: "c29",
        body: "Job completed successfully. Final payment collected on-site.",
        role: "OPERATOR",
        type: "PHONE",
        createdAt: new Date(Date.now() - 86400000 * 9),
      },
      // DEMO
      {
        id: "c30",
        body: "Demo completed + quote approved.",
        role: "OPERATOR",
        type: "DEMO",
        createdAt: new Date(Date.now() - 86400000 * 10),
      },
      // EMAIL
      {
        id: "c31",
        body: "Hi Emily, thank you for choosing us! Invoice and warranty docs are attached. We'd love a review if you have a moment 🙏",
        role: "AI",
        type: "EMAIL",
        mediaAttachments: [
          {
            id: "a3",
            filename: "invoice.pdf",
            mimeType: "application/pdf",
            size: 51200,
            mediaSource: "EXTERNAL",
            mediaUrl: "https://placehold.co/600x400?text=Invoice+PDF",
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 8),
      },
      // MEETING
      {
        id: "c32",
        body: "Post-job walkthrough completed with Emily. All rooms signed off. Minor touch-up on hallway trim done on the spot.",
        role: "OPERATOR",
        type: "MEETING",
        createdAt: new Date(Date.now() - 86400000 * 8 + 3600000),
      },
    ],
  },
];
