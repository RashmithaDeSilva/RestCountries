import { RedisStore } from "connect-redis"
import redisClient from "../config/RedisCon.mjs";
import { LogTypes } from "../utils/types/LogTypes.mjs";
import { log } from "../utils/ConsoleLog.mjs";

// Initialize store.
const redisCacheStore = new RedisStore({
    client: redisClient,
    prefix: "cache:",
    // ttl: 60 * 60,
    disableTTL: true
})
log(LogTypes.INFO, "Cache Store Initialized");

export default redisCacheStore;