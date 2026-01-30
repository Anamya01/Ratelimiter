const express = require('express')
const crypto = require('crypto')
const ratelimiter = require('../middleware/Ratelimiter');
const { getRedisClient } = require('../config/redis.config');
const router = express.Router()


//to generate api keys 
router.post('/key', async (req, res) => {
  try {
    const { name, limit, window, strategy } = req.body;
    if (!name) {
      return res.status(400).json({ error : "Name is required"});
    }
    
    //generate unique api keys
    const api = `rl_${crypto.randomBytes(32).toString("base64url")}`
    
    const config = {
      name : name,
      limit : limit || 100,
      window: window || 60000,
      strategy: strategy || "token-bucket",
      createdAt: Date.now().toString()
    }
    
    const redis = await getRedisClient();
    await redis.hSet(`apikey:${api}`, config)
    
    res.json({
      api,
      config: {
        name: config.name,
        limit: parseInt(config.limit),
        window: parseInt(config.window),
        strategy: config.strategy
      }
    })
    
  }
  catch (error) {
    console.error("Error while generating api", error)
    res.status(500).json({error : "Failed to generate the Api Key"})
  }
})

//get the configuration of apis
router.get('/key/', (req, res) => {
  
})

//get the api usage 
router.get('/usage', (req, res) => { 
  
})

//protected test get request 
router.get('/test', ratelimiter(),  (req, res) => {
  res.json({
  message: 'Success! Request passed through rate limiter',
  timestamp: new Date().toISOString()
  });
})

//protected test post request
router.post('/test', ratelimiter(),  (req, res) => {
  res.json({
   message: 'POST request successful',
   body: req.body,
   timestamp: new Date().toISOString()
   });
})


module.exports = router