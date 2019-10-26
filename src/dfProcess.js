const dialogflow = require('dialogflow')
const uuid = require('uuid')

const languageDetect = require('./languageDetect')

const df = async (message, projectId = 'bot-lek') => {
  const sessionId = uuid.v4()

  const sessionClient = new dialogflow.SessionsClient()
  const sessionPath = sessionClient.sessionPath(projectId, sessionId)

  const language = await languageDetect(message)

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: language[0].language
      }
    }
  }

  const responses = await sessionClient.detectIntent(request)
  const result = responses[0].queryResult
  if (result.intent) {
    return result
  } else {
    return 'error'
  }
}

module.exports = df
