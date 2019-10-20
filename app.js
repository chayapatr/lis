const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const line = require('@line/bot-sdk')

const axios = require('axios')
const dialogflow = require('dialogflow')
const uuid = require('uuid')

require('dotenv').config()

const lineConfig = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
}

const client = new line.Client(lineConfig)

app.post('/callback', line.middleware(lineConfig), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch(err => console.log(err))
})

const handleEvent = async event => {
    let returnText = JSON.stringify(event)
    if (event.type !== 'message') {
        return Promise.resolve(null);
    }
    if (event.message.type === 'text') {
        const message = event.message.text;
        let dfReturn = await df(message)
        if (dfReturn.intent.displayName === 'lis.fetch') {
            let type = dfReturn.parameters.fields
            if (type.maidreamin.stringValue !== '') {
                let fetch = await axios.get("https://maidreamin.now.sh")
                returnText = JSON.stringify(fetch.data)
            } else {
                returnText = "na" + JSON.stringify(event)
            }
        }
        else {

        }
    }
    if (event.message.type === 'location') {
        let fetch = await axios({
            "method": "GET",
            "url": "https://air-quality.p.rapidapi.com/current/airquality",
            "headers": {
                "content-type": "application/octet-stream",
                "x-rapidapi-host": "air-quality.p.rapidapi.com",
                "x-rapidapi-key": process.env.rapidapikey
            },
            "params": {
                "lon": event.message.longitude,
                "lat": event.message.latitude
            }
        })
        returnText = JSON.stringify(fetch.data)
    }
    // if (message === `aqi`) {

    // } else if (message === `maid`) {
    //     let fetch = await axios.get("https://maidreamin.now.sh")
    //     returnText = JSON.stringify(fetch.data)
    // }
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: returnText
    }).catch(err => console.log(JSON.stringify(err)))
}

const df = async (message, projectId = 'bot-lek') => {
    const sessionId = uuid.v4();

    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'en-US',
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    if (result.intent) {
        return result
    } else {
        return `error`
    }
}

app.get("/", async (req, res) => {
    res.send("helloworld")
})

app.listen(PORT, () => {
    console.log(`Port : ${PORT}`)
})