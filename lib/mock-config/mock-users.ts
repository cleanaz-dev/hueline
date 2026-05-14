// Do NOT import SubdomainUser here – we don't need the type assertion
const SHARED_SUBDOMAIN = {
  id: "69366b42e5518e5d2f4df443",
  slug: "demo",
} as const; // 'as const' preserves literal types, optional

export const MOCK_USERS = [
  {
    id: "mockuser1",
    email: "admin@demo.com",
    name: "Alice Johnson",
    passwordHash: "$2b$10$hashedAlice",
    imageUrl: "https://example.com/alice.png",
    role: "ADMIN",
    subdomainId: SHARED_SUBDOMAIN.id,
    subdomain: SHARED_SUBDOMAIN,
    rooms: [],
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-07-20"),
    clientCommunications: [],
    systemTasks: [],
  },
  {
    id: "mockuser2",
    email: "painter@demo.com",
    name: "Bob Smith",
    passwordHash: "$2b$10$hashedBob",
    imageUrl: null,
    role: "MEMBER",
    subdomainId: SHARED_SUBDOMAIN.id,
    subdomain: SHARED_SUBDOMAIN,
    rooms: [],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-07-18"),
    clientCommunications: [],
    systemTasks: [],
  },
  {
    id: "mockuser3",
    email: "viewer@demo.com",
    name: "Charlie Brown",
    passwordHash: "$2b$10$hashedCharlie",
    imageUrl: null,
    role: "VIEWER",
    subdomainId: SHARED_SUBDOMAIN.id,
    subdomain: SHARED_SUBDOMAIN,
    rooms: [],
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-07-22"),
    clientCommunications: [],
    systemTasks: [],
  },
];

