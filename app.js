const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const line = require('@line/bot-sdk')
const axios = require('axios')

const dfProcess = require('./src/dfProcess')
const { addRecord } = require('./src/accounting')

require('dotenv').config()

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

const client = new line.Client(lineConfig)

app.post('/callback', line.middleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => console.log(err))
})

const handleEvent = async event => {
  let returnText = JSON.stringify(event)
  if (event.type !== 'message') {
    return Promise.resolve(null)
  }

  if (event.message.type === 'text') {
    const dfReturn = await dfProcess(event.message.text)
    const fields = dfReturn.parameters.fields

    if (dfReturn.intent.displayName === 'lis.fetch') {
      if (fields.fetch.stringValue === 'maidreamin') {
        const fetch = await axios.get('https://maidreamin.now.sh')
        returnText = JSON.stringify(fetch.data)
      } else {
        returnText = 'na' + JSON.stringify(event)
      }
    } else if (dfReturn.intent.displayName === 'lis.accounting') {
      const tag = [
        'Food',
        'Transport',
        'Movie',
        'Study',
        'Book',
        'Online',
        'etc',
        'Income'
      ]
      if (tag.includes(fields['a-type'].stringValue)) {
        const name =
          fields.any.stringValue || fields['a-type'].stringValue
        if (fields['a-type'].stringValue !== 'Income') {
          fields['number-integer'].numberValue = -fields[
            'number-integer'
          ].numberValue
        }
        addRecord(
          name,
          fields['a-type'].stringValue,
          fields['number-integer'].numberValue
        )
        returnText = JSON.stringify({
          status: 'record added',
          name: name,
          type: fields['a-type'].stringValue,
          amount: fields['number-integer'].numberValue
        })
      } else {
        returnText = 'Type not found'
      }
    }
  }

  if (event.message.type === 'location') {
    const fetch = await axios({
      method: 'GET',
      url: 'https://air-quality.p.rapidapi.com/current/airquality',
      headers: {
        'content-type': 'application/octet-stream',
        'x-rapidapi-host': 'air-quality.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY
      },
      params: {
        lon: event.message.longitude,
        lat: event.message.latitude
      }
    })
    returnText = JSON.stringify(fetch.data)
  }

  return client
    .replyMessage(event.replyToken, {
      type: 'text',
      text: returnText
    })
    .catch(err => console.log(JSON.stringify(err)))
}

app.get('/', async (req, res) => {
  res.send('helloworld')
})

app.listen(PORT, () => {
  console.log(`Port : ${PORT}`)
})
