require("dotenv").config({ path: ".env.local" });

const { createClient } = require("redis");

async function clearRedisCache() {
  const client = createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  await client.flushDb();

  await client.close();

  console.log("Redis cache cleared");
}

clearRedisCache();
