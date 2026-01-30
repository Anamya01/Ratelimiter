const { getRedisClient } = require("../config/redis.config")
const TokenBucket = require("../strategies/TokenBucket")

async function getConfig(ApiKey) {
  //get configuration from redis
  const redis = getRedisClient()
  const config = redis.hGetAll(`apikey:${ApiKey}`)
  
  if (!config || !config.limit) {
    return null
  }
  
  return {
    name: config.name,
    limit: parseInt(config.limit),
    window: parseInt(config.window),
    strategy: config.strategy || "token-bucket",
  }
  
}

function createLimiter(strategy, config) {
  const refillRate = config.limit / (config.window / 1000)
  return new TokenBucket(config.limit, refillRate)
} //instanciating

const ratelimiter = () => {
  return  async (req, res, next) => {
    const ApiKey = req.headers["x-api-key"]
    
    if (!ApiKey) {
      return res.status(401).json({
        error: "API key is Required",
        message : "Please provide a valid api key in the x-api-header"
      })
    }
    try {
      const config = getConfig(ApiKey);
      if (!config) {
        return res.status(401).json({
          error: "Invalid Api Key",
          message: "the api key expired or invalid"
        })
      }
      const strategy = config.strategy;
      const limiter = createLimiter(strategy, config);
      let result = await limiter.allowRequest(ApiKey);
      
      
      if (!result.allowed) {
        res.setHeader('Retry-After', 60);
        return res.status(429).json({
          error: "rate limit exceeded",
          message: "too many requests, please try after some time.",
        })
      }
      next();
    }
    catch (error) {
      console.error(error)
      res.status(500).json(
        {
          error: "Internal server error",
          message : "Rate limiter encountered some error"
        }
      )
    }
  }
}

module.exports = ratelimiter;