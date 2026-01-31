const { getRedisClient } = require('../config/redis.config')

class TokenBucket{
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
  }
  
  async allowRequest(key) {
    const redis = getRedisClient() 
    const now = Date.now();
    const BucketKey = `Rate:TokenBucket:${key}`
    
    try {
      const data = await redis.hGetAll(BucketKey);      
      let token = data.token ? parseFloat(data.token) : this.capacity;
      const lastRefill = data.lastRefill ? parseFloat(data.lastRefill) : now;
      
      const timePassed = (now - lastRefill) / 1000;
      token = Math.min(this.capacity, token + (timePassed * this.refillRate));

      if (token >= 1) {
        token -= 1;
        await redis.hSet(BucketKey, {
          token: token.toString(),
          lastRefill: now.toString()
        })
        await redis.expire(BucketKey, 3600);
        return {
          allowed: true,
          remaining: Math.floor(token),
        };
      }
      return {
        allowed: false,
        remaining : 0
      }
    }
    catch (err) {
      console.error("token bucket error :", err)
      throw err;
    }  
  }
}

module.exports = TokenBucket