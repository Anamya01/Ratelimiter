const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { redisInit } = require('./config/redis.config')

dotenv.config()
const app = express()
app.use(cors())

const PORT = process.env.PORT || 3000

redisInit().then(() => {
  console.log("redis client connected")
}).catch((err) => {
  console.log("Issue with connecting to redis", err)
})

app.get('/health', (req, res) => {
  console.log("in health checkup")
  res.json({"status" : "Healthy"})
})

app.listen(PORT, () => {
  console.log(`server running at ${PORT}`)
})