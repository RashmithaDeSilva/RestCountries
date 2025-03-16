import { createClient } from "redis"
import dotenv from "dotenv";
import { LogTypes } from "../utils/types/LogTypes.mjs";
import { log } from "../utils/ConsoleLog.mjs";

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
    log(LogTypes.ERROR, `Redis client error: ${ error }`);
    process.exit(1);
});
log(LogTypes.INFO, "Redis Client Initialized");

// Connect with redis
await redisClient.connect();
log(LogTypes.INFO, "Redis Client Connected Successfully");

export default redisClient;
