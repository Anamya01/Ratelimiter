const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const apiRouter = require('./routes/api')
const { redisInit } = require('./config/redis.config')
const { initPostgres } = require('./config/postgres.config')

dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())


const PORT = process.env.PORT || 3000

Promise.all([
  redisInit(),
  initPostgres()
  ]).then(() => {
  console.log("redis client connected")
}).catch((err) => {
  console.log("Issue with connecting to redis", err)
  process.exit(1);
})

app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  console.log("in health checkup")
  res.json({"status" : "Healthy"})
})

app.listen(PORT, () => {
  console.log(`server running at ${PORT}`)
})