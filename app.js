const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const line = require('@line/bot-sdk')

const handleMessage = require('./src/handleMessage')
const handleTWFAMessage = require('./src/twfa')

require('dotenv').config()

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

const lineTWFAConfig = {
  channelAccessToken: process.env.TWFA_LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.TWFA_LINE_CHANNEL_SECRET
}

const client = new line.Client(lineConfig)

const TWFAClient = new line.Client(lineTWFAConfig)

app.post('/callback', line.middleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => console.log(err))
})

app.post('/twfa', line.middleware(lineTWFAConfig), (req, res) => {
  Promise.all(req.body.events.map(twfaEvent))
    .then(result => res.json(result))
    .catch(err => console.log(err))
})

const twfaEvent = async event => {
  if (
    event.type !== 'message' ||
    !event.message.text.includes('น้อง')
  ) {
    return Promise.resolve(null)
  }
  console.log(event)
  const returnMessage = await handleTWFAMessage(event)
  console.log(returnMessage)
  if (returnMessage.type === 'return') {
    return TWFAClient.replyMessage(
      event.replyToken,
      returnMessage.object
    ).catch(err => console.log(err))
  } else return Promise.resolve(null)
}

const handleEvent = async event => {
  if (event.type !== 'message') {
    return Promise.resolve(null)
  }
  const returnMessage = await handleMessage(event)
  return client
    .replyMessage(event.replyToken, returnMessage)
    .catch(err => console.log(JSON.stringify(err)))
}

app.get('/', async (req, res) => {
  res.send('helloworld')
})

app.listen(PORT, () => {
  console.log(`Port : ${PORT}`)
})
