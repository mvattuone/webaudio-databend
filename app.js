const express = require('express')
const path = require('path')
const app = express()

app.get('/', (req, res) => {
  const index = path.resolve('./index.html')
  res.sendFile(index)
})

app.get('/dist/databend.js', (req, res) => {
  const index = path.resolve('./dist/databend.js')
  res.sendFile(index)
})

app.listen(3000, () => {
  console.log('SERVER RUNNING, BITCH!!!')
})
