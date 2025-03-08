import { RedisStore } from "connect-redis";
import { createClient } from "redis";

// Create redis client
const redisClient = createClient({
    socket: {
        host: "localhost",
        port: 6379,
    },
});

redisClient.on("[ERROR] - ", (error) => {
    console.log("Redis client error", error);
    process.exit(1);
});

// Connect with redis
await redisClient.connect();