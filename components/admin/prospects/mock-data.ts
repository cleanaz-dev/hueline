export const MOCK_PROSPECTS = [
  {
    id: "1",
    name: "John Smith",
    phone: "+15551234567",
    email: "john@example.com",
    status: "BOOKED",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    subBookingData: { huelineId: "cal_123" },
    communication: [
      { id: "m1", role: "AI", body: "Hi John! Confirmed your painting consult for Friday at 2pm.", createdAt: new Date(Date.now() - 3600000) },
      { id: "m2", role: "CLIENT", body: "Thanks! Do I need to move the furniture?", createdAt: new Date(Date.now() - 3500000) },
      { id: "m3", role: "AI", body: "Ideally yes, clearing the perimeter helps us get started faster!", createdAt: new Date(Date.now() - 3450000) },
    ]
  },
  {
    id: "2",
    name: "Sarah Miller",
    phone: "+15559876543",
    email: "sarah@outlook.com",
    status: "LEAD",
    createdAt: new Date(Date.now() - 3600000 * 5),
    subBookingData: null,
    communication: [
      { id: "m4", role: "CLIENT", body: "How much for a 2-bedroom apartment?", createdAt: new Date(Date.now() - 300000) },
      { id: "m5", role: "AI", body: "Our rates vary based on wall condition. Would you like a quick demo of how we quote?", createdAt: new Date(Date.now() - 250000) },
    ]
  }
];