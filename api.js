const fs = require('fs')

module.exports = {
  getHealth,
  getData,
  updateData,
  deleteData
}

const dataUrlPrefix = `./data`

async function getHealth (req, res, next) {
  res.json({ success: true })
}

async function getData (req, res, next) {
  const studentId = req.params.studentId
  const fileName = `${dataUrlPrefix}/${studentId}.json`
  fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(404).send('File does not exist')
      } else {
        throw err
      }
    } else {
      const finalJsonData = data ? JSON.parse(data.toString()) : {}
      // check for nested properties
      let urlProperties = req.params[0]
      if ((urlProperties && urlProperties.replace(/\s+/g, '').trim().length !== '')) {
        if (!Object.keys(finalJsonData).length) {
          res.status(404).send('File does not contain any valid data')
        } else {
          let foundPropertyValue = propertiesRetrive(urlProperties.trim(), finalJsonData)
          if (foundPropertyValue) {
            res.json({
              success: true,
              studentId,
              data: foundPropertyValue
            })
          } else {
            res.status(404).json({
              error: true,
              message: 'Property does not exist'
            })
          }
        }
      } else {
        res.json({
          success: true,
          studentId,
          data: finalJsonData
        })
      }
    }
  })
}

async function updateData (req, res, next) {
  const studentId = req.params.studentId
  let updateThisData = req.body || {}
  updateThisData = JSON.parse(JSON.stringify(req.body))
  const fileName = `${dataUrlPrefix}/${studentId}.json`
  fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Create the file
        let fetchedJsonData = {}
        // check for nested properties
        let urlProperties = req.params[0]
        if ((urlProperties && urlProperties.replace(/\s+/g, '').trim().length !== '')) {
          fetchedJsonData = objectGeneration(urlProperties, fetchedJsonData, updateThisData) // add any extra property then write to the database
        }
        const writableData = JSON.stringify(fetchedJsonData)
        fs.writeFile(fileName, writableData, (err2) => {
          if (err2) {
            // an error occured while trying to write data
            res.status(400).json({
              error: true,
              message: 'Error while trying to write data'
            })
          } else {
            res.json({
              success: true,
              studentId,
              data: fetchedJsonData
            })
          }
        })
      } else {
        throw err
      }
    } else {
      let fetchedJsonData = data ? JSON.parse(data.toString()) : {}
      // check for nested properties
      let urlProperties = req.params[0]
      if ((urlProperties && urlProperties.replace(/\s+/g, '').trim().length !== '')) {
        fetchedJsonData = objectGeneration(urlProperties, fetchedJsonData, updateThisData) // add any extra property then write to the database
      }
      const writableData = JSON.stringify(fetchedJsonData)
      fs.writeFile(fileName, writableData, (err2) => {
        if (err2) {
          // an error occured while trying to write data
          res.status(400).json({
            error: true,
            message: 'Error while trying to write data'
          })
        } else {
          res.json({
            success: true,
            studentId,
            data: fetchedJsonData
          })
        }
      })
    }
  })
}

async function deleteData (req, res, next) {
  const studentId = req.params.studentId
  const fileName = `${dataUrlPrefix}/${studentId}.json`
  fs.unlink(fileName, (err) => {
    if (err) {
      res.status(404).json({
        error: true,
        message: 'Error while trying to delete file'
      })
    } else {
      res.json({
        success: true
      })
    }
  })
}

/***
 * objectGeneration(urlString, jsonObject)
 * Function to generate the url nested object from the other Propertynames passed from the url
*/
function objectGeneration (urlString, jsonObject, newData) {
  let propertyNamesArray = urlString.replace(/\s+/g, '').trim().split('/').filter(n => n) // Remove empty spaces or double space => trim => split into array then filter the array
  const reducer = (obj, prop) => {
    obj[prop] = (obj && obj[prop] && Object.keys(obj[prop]).length !== 0) ? obj[prop] : {} // if a property in the array does not exist we create it and assign it an empty object
    return obj[prop]
  }
  propertyNamesArray.reduce(reducer, jsonObject)
  // update the properties of the the new object
  const updatedObject = updateProperties(jsonObject, propertyNamesArray, newData)
  return updatedObject
}

/**
 * propertiesRetrive(props, obj)
 * function that gets the properties from the jsonData
 */
function propertiesRetrive (pathArr, nestedObj) {
  let tempArr = pathArr.replace(/\s+/g, '').trim().split('/').filter(n => n) // Remove empty spaces or double space => trim => split into array then filter the array
  const reducer = (obj, key) => {
    return (obj && obj[key] !== 'undefined') ? obj[key] : null // dig deep into the object while iterating through the array values as keys to the object.
  }
  return tempArr.reduce(reducer, nestedObj)
}

function updateProperties (currentObj, propertyPath, newData) {
  const reducerFn = (currentObj, arrKey, index) => {
    if (index === propertyPath.length - 1) {
      // delete currentObj[arrKey]
      return (currentObj[arrKey] = newData)
    }
    return currentObj[arrKey]
  }
  propertyPath.reduce(reducerFn, currentObj)

  return currentObj
}
