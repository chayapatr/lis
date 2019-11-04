const axios = require('axios')

const dfProcess = require('./dfProcess')
const qrGenerate = require('./qrGenerate')
const { addRecord } = require('./accounting')

const handleMessage = async event => {
  let returnText = JSON.stringify(event)

  if (event.message.type === 'text') {
    const dfReturn = await dfProcess(event.message.text)
    if (dfReturn !== 'error') {
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
            amount: Math.abs(fields['number-integer'].numberValue)
          })
        } else {
          returnText = 'Type not found'
        }
      } else if (dfReturn.intent.displayName === 'lis.money') {
        const data = await qrGenerate(fields.number.numberValue)
        console.log(data)
        return {
          type: 'image',
          originalContentUrl: data,
          previewImageUrl: data
        }
      }
    } else {
      returnText = 'error'
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
  return {
    type: 'text',
    text: returnText
  }
}

module.exports = handleMessage
