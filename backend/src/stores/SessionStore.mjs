import { RedisStore } from "connect-redis"
import redisClient from "../config/RedisCon.mjs";
import { LogTypes } from "../utils/enums/LogTypes.mjs";
import { log } from "../utils/ConsoleLog.mjs";

// Initialize store.
const redisSessionStore = new RedisStore({
    client: redisClient,
    prefix: "session:",
    // disableTTL: true
})
log(LogTypes.INFO, "Session Store Initialized");

export default redisSessionStore;