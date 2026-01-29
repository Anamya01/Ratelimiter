const redis = require('redis')

let client 


//Initializing redis client 
async function redisInit() {
  client = redis.createClient({
    url:process.env.REDIS_URL
  })
  
  client.on('error', (err) => {
    console.log("Redis Client Error :", err)
  })
  client.on('connect', () => {
    console.log("Redis Connected")
  })
  
  await client.connect()
  return client
  
}

//getting redis client 
function getRedisClient() {
  if (!client) {
    throw new error("Redis client not initialized")
  }
  return client;
}


module.exports = {getRedisClient, redisInit}
