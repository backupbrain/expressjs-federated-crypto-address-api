const express = require('express')
const addressRoutes = require('./routes/addresses.js')
require('./config/credentials.js')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.set('view engine', 'pug')
app.set('views', './views')

const port = 3000

/**
 * Routes
 */
app.get('/', function (req, res) {
  res.render('index')
})

app.use('/api/1.0/addresses', addressRoutes)

app.use((req, res) => {
  res.status(404).json({ status: 'error', error: 'Resource not found' })
})

app.listen(port, () => {
  console.log(`Server running at port ${port}`)
})
