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
  const url = `${endpoint}/testStudentId/courses/calculus/quizzes/ye0ab61`
  const valueUpdate = 98
  jsonist.put(url, { score: valueUpdate }, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'Should have a successful update')
    t.ok(body.studentId, 'Should have a student ID')
    t.ok(body.data, 'Should have data property that will contain the result data')
    t.equals(body.data.courses.calculus.quizzes.ye0ab61.score, valueUpdate, `Value of (courses.calculus.quizzes.ye0ab61.score) should equal to ${valueUpdate}`)
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
  const url = `${endpoint}/testStudentId/courses/calculus/quizzes/ye0ab61`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'Should have a successful request')
    t.ok(body.data, 'Should have a data property')
    t.end()
  })
})

tape('Delete property data', async function (t) {
  const url = `${endpoint}/testStudentId/courses/calculus/quizzes`
  jsonist.delete(url, (err1, body1) => {
    if (err1) t.error(err1)
    t.ok(body1.success, 'Should have a successful delete')
    t.end()
  })
})

tape('Delete property from a file that does not exist', async function (t) {
  const url2 = `${endpoint}/testStudentId1111/courses/`
  jsonist.delete(url2, (err2, body2) => {
    if (err2) {
      t.equal(err2.statusCode, 404, 'Should return a 404 when deleting a file whose studentID.json does not exist')
    }
    t.end()
  })
})

tape('Delete property that does not exist data', async function (t) {
  const url2 = `${endpoint}/testStudentId/courses/nonExistingcalculus`
  jsonist.delete(url2, (err2, body2) => {
    if (err2) {
      t.equal(err2.statusCode, 404, 'Should return a 404 when deleting a property does not exist')
    }
    t.end()
  })
})

tape('cleanup', function (t) {
  server.close()
  t.end()
})
