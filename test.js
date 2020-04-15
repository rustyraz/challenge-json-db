const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})

tape('updateData', async function (t) {
  const url = `${endpoint}/testStudentId/propertyName1`
  jsonist.put(url, { score: 98 }, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'Should have a successful update')
    t.ok(body.studentId, 'Should have a student ID')
    t.end()
  })
})

tape('Get data using student ID', async function (t) {
  const url = `${endpoint}/testStudentId/`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'Should have a successful get request')
    t.ok(body.studentId, 'Should have a student ID')
    t.ok(body.data, 'Should have a data object')
    t.end()
  })
})

tape('Get data of non existing student ID', async function (t) {
  const url = `${endpoint}/testStudentIdDoesNotExist/`
  jsonist.get(url, (err, body) => {
    if (err) {
      t.equal(err.statusCode, 404, 'Should return a 404 for file does not exist')
      // t.error(err)
    }
    t.end()
  })
})

tape('Get property data', async function (t) {
  const url = `${endpoint}/testStudentId/propertyName1`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'Should have a successful request')
    t.ok(body.data, 'Should have a data property')
    t.end()
  })
})

// tape('Delete data', async function (t) {
//   const url = `${endpoint}/testStudentId/`
//   jsonist.delete(url, (err1, body1) => {
//     if (err1) t.error(err1)
//     t.ok(body1.success, 'Should have a successful delete')
//     t.end()
//   })
// })

tape('cleanup', function (t) {
  server.close()
  t.end()
})
