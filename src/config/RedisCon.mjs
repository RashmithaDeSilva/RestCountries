import { createClient } from "redis"
import dotenv from "dotenv";

dotenv.config();

// Create redis client
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_SESSION_STORE_HOST || "localhost",
        port: Number(process.env.REDIS_SESSION_STORE_PORT) || 6379,
    },
});

// Handle errors properly
redisClient.on("[ERROR] - ", (error) => {
    console.log("[INFO] - Redis client error: ", error);
    process.exit(1);
});
console.log("[INFO] - Redis Session Store Client Initialized");

// Connect with redis
await redisClient.connect();
console.log("[INFO] - Redis Session Store Client Connected Successfully");

export default redisClient;
