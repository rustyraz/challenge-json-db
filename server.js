const express = require('express')
const bodyParser = require('body-parser')

const api = require('./api')
const middleware = require('./middleware')

const PORT = process.env.PORT || 1337

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/health', api.getHealth)
app.put('/:studentId/*?', api.updateData)
app.get('/:studentId/*?', api.getData)
app.delete('/:studentId/*?', api.deleteData)

app.use(middleware.handleError)
app.use(middleware.notFound)

const server = app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
)

if (require.main !== module) {
  module.exports = server
}
