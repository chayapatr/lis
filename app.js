const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const line = require('@line/bot-sdk')
const axios = require('axios')
const moment = require('moment')

const df = require('./src/df')
const accounting = require('./src/accounting')

require('dotenv').config()

const lineConfig = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret
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
    const dfReturn = await df(event.message.text)
    const type = dfReturn.parameters.fields
    if (dfReturn.intent.displayName === 'lis.fetch') {
      if (type.fetch.stringValue === 'maidreamin') {
        const fetch = await axios.get('https://maidreamin.now.sh')
        returnText = JSON.stringify(fetch.data)
      } else {
        returnText = 'na' + JSON.stringify(event)
      }
    } else if (dfReturn.intent.displayName === 'lis.accounting') {
      const d = new Date()
      const date = moment(d).format('YYYY-MM-DD')
      const name = type.any.stringValue
        ? type.any.stringValue
        : type['a-type'].stringValue === 'Income'
        ? 'Annual'
        : type['a-type'].stringValue

      accounting(
        name,
        type['a-type'].stringValue,
        date,
        type['number-integer'].numberValue
      )
    }
  }

  if (event.message.type === 'location') {
    const fetch = await axios({
      method: 'GET',
      url: 'https://air-quality.p.rapidapi.com/current/airquality',
      headers: {
        'content-type': 'application/octet-stream',
        'x-rapidapi-host': 'air-quality.p.rapidapi.com',
        'x-rapidapi-key': process.env.rapidapiKey
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
