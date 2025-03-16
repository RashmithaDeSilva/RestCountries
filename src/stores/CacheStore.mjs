import { RedisStore } from "connect-redis"
import redisClient from "../config/RedisCon.mjs";

// Initialize store.
const redisCacheStore = new RedisStore({
    client: redisClient,
    prefix: "cache:",
    // ttl: 60 * 60,
    disableTTL: true
})
console.log("[INFO] - Redis Cache Store Initialized");

export default redisCacheStore;