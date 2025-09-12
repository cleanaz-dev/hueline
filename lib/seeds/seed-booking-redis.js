require("dotenv").config({ path: ".env.local" });

const { createClient } = require("redis");

async function createRedisBooking() {
  const client = createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  });

  try {
    await client.connect();
    console.log("Connected to Redis");

    // Sample booking matching your Python report structure
    const booking = {
      name: "John Doe",
      prompt: "Make my living room more modern with neutral colors",
      original_images: [
        "https://res.cloudinary.com/dmllgn0t7/image/upload/v1757537446/decor/%2B14373884985/mwrvm8jg25plxuco61zz.jpg",
      ],
      mockup_urls: [
        "https://res.cloudinary.com/dmllgn0t7/image/upload/v1757537464/yppinzpldnicjbqd9pe8.png", 
      ],
      paint_colors: ["#F5F5DC", "Sage Green", "#8B7D6B"],
      summary: "This room makeover transforms a traditional living space into a modern sanctuary. The neutral color palette creates a calming atmosphere while maintaining warmth. Strategic lighting and furniture placement maximize the room's natural flow."
    };

    // Use the same key format as your getBooking function
    const keys = {
      booking: (phoneNumber) => `booking:${phoneNumber}`
    };

    const phoneNumber = "1234567890";
    const bookingKey = keys.booking(phoneNumber);
    
    // Store booking as JSON string
    await client.set(bookingKey, JSON.stringify(booking));
    
    console.log("Booking created with key:", bookingKey);
    console.log("Data:", booking);
    
    // Test retrieval
    const retrieved = await client.get(bookingKey);
    console.log("Retrieved booking:", JSON.parse(retrieved));

  } catch (error) {
    console.error("Redis error:", error);
  } finally {
    await client.quit();
    console.log("Disconnected from Redis");
  }
}

createRedisBooking();