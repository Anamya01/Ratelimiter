class SlidingWindow {
  async allowRequest(key, limit, windowms) {
    const redis = await getRedisClient();
    const now = Date.now();
    const windowKey = `ratelimit:sliding:${key}`;
   
    try {
      await redis.zRemRangeByScore(windowKey, 0, now - windowms);
      const count = await redis.zCard(windowKey);
      if (count < limit) {
      await redis.zAdd(windowKey, {
        score: now,
        value: `${now}-${Math.random()}`
      });
      await redis.expire(windowKey, Math.ceil(windowMs / 1000) + 1);
      return {
        allowed: true,
        remaining: limit - count - 1
        };
      }
      const oldest = await redis.zRange(windowKey, 0, 0, { withScores: true });
      return {
      allowed: false,
      remaining: 0,
        };
      }
  catch(error) {
    console.error("Sliding Window Error,", error);
    throw error
  }
  }
}
module.exports = SlidingWindow;