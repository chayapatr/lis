require('dotenv').config()

const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000

const line = require('@line/bot-sdk')

const axios = require('axios')
const dialogflow = require('dialogflow')
const uuid = require('uuid')

const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
}

const client = new line.Client(config)

app.post('/callback', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
})

const handleEvent = async event => {
    let returnText = JSON.stringify(event)
    if (event.type !== 'message') {
        //return Promise.resolve(null);
        returnText = "not message"
    }
    if(event.message.type === 'text') {
        const message = event.message.text;
        let dfReturn = await df(message)
        if(dfReturn.intent.displayName === 'lis.fetch') {
            let type = dfReturn.parameters.fields
            if(type.weather.stringValue !== '') {
                returnText = "weather" + JSON.stringify(event)
            } else if(type.maidreamin.stringValue !== '') {
                returnText = "maid" + JSON.stringify(event)
            } else {
                returnText = "na" + JSON.stringify(event)
            }
        }
    }
    if (event.message.type === 'location') {
        returnText = JSON.stringify({
            lat: event.message.latitude,
            lon: event.message.longitude
        });
    }
    // if (message === `aqi`) {

    // } else if (message === `maid`) {
    //     let fetch = await axios.get("https://maidreamin.now.sh")
    //     returnText = JSON.stringify(fetch.data)
    // }
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: returnText
    });
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
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
        return result
    } else {
        console.log(`  No intent matched.`);
        return `error`
    }
}

app.get("/", async (req, res) => {
    let data = await func("hello")
    res.send(data)
})

app.listen(PORT, () => {
    console.log(`Port : ${PORT}`)
})

// const express = require('express')
// const app = express()

// const PORT = process.env.PORT || 3000

// app.get("/", (req,res) => {
//     res.status(200).send("helloworld").end()
// })

// app.listen(PORT, () => {
//     console.log(`${PORT}`)
// })

// module.export = app