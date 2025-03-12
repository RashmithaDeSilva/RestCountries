import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create redis client
const sessionStore = createClient({
    socket: {
        host: process.env.REDIS_SESSION_STORE_HOST,
        port: process.env.REDIS_SESSION_STORE_PORT,
    },
});

sessionStore.on("[ERROR] - ", (error) => {
    console.log("Redis client error", error);
    process.exit(1);
});
console.log("[INFO] - Redis Session Store Initialized");

// Connect with redis
await sessionStore.connect();
console.log("[INFO] - Redis Session Store Connected Successfully");

export { sessionStore };