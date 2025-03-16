import { RedisStore } from "connect-redis"
import redisClient from "../config/RedisCon.mjs";

// Initialize store.
const redisSessionStore = new RedisStore({
    client: redisClient,
    prefix: "session:",
    // disableTTL: true
})
console.log("[INFO] - Redis Session Store Initialized");

export default redisSessionStore;