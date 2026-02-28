const { getRedisClient } = require("../config/redis.config");

class FixedWindow{
  async allowRequest(key, limit, windowms) {
    const redis = await getRedisClient();
    const now = Date.now();
    
    const windowStart = Math.floor(now / windowms) * windowms;
    const WindowKey = `Rate:FixedWindow:${key}:${windowStart}`
    try {
      const count = await redis.incr(WindowKey);
      if (count === 1) {
        await redis.expire(WindowKey, Math.ceil(windowms/1000)+1);
      }
      if (count <= limit) {
        return {
          allowed: true,
          remaining: limit - count
        };
      }
      else {
        return {
          allowed: false,
          remaining: 0
        };
      }
    }
    catch (error) {
      console.error('Fixed Window Error', error)
      throw error;
    }
  }
}

module.exports = FixedWindow;