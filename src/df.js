const dialogflow = require('dialogflow')
const uuid = require('uuid')

const df = async (message, projectId = 'bot-lek') => {
  const sessionId = uuid.v4()

  const sessionClient = new dialogflow.SessionsClient()
  const sessionPath = sessionClient.sessionPath(projectId, sessionId)

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US'
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
