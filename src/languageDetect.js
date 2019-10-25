const { Translate } = require('@google-cloud/translate')
require('dotenv').config()

const translate = new Translate()

const languageDetect = async text => {
  let [detections] = await translate.detect(text)
  detections = Array.isArray(detections) ? detections : [detections]
  return detections
}

module.exports = languageDetect
