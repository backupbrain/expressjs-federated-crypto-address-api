const express = require('express')
const app = express()

// Middleware function to log request protocol
app.use('/api/1.0/addresses/:username/:coin/', (req, res, next) => {
  console.log(`A request for things received at ${Date.now()}`)
  next()
})
