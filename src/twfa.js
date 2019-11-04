const dfProcess = require('./dfProcess')

// const Airtable = require('airtable')
// const moment = require('moment')
require('dotenv').config()

// const base = new Airtable({
//   apiKey: process.env.TWFA_AIRTABLE_API_KEY
// }).base(process.env.TWFA_AIRTABLE_BASE)

// const table = 'Accounting'

// const addRecord = async (name, tag, account) => {
//   const d = new Date()
//   const date = moment(d).format('YYYY-MM-DD')
//   const create = base(table).create(
//     [
//       {
//         fields: {
//           Name: name,
//           Tag: tag,
//           Date: date,
//           Amount: account
//         }
//       }
//     ],
//     (err, records) => {
//       if (err) {
//         console.error(err)
//         return
//       }
//       records.forEach(function(record) {
//         console.log(record.getId())
//       })
//     }
//   )
//   return create
// }

// const search = filter =>
//   base(table)
//     .select(filter)
//     .all()

// const summary = async filter => {
//   const summary = {
//     sum: 0,
//     income: 0,
//     expense: 0
//   }
//   const tableData = await search(filter)
//   tableData.forEach(record => {
//     const fields = record.fields
//     summary.sum += fields.Amount
//     fields.Tag === 'Income'
//       ? (summary.income += fields.Amount)
//       : (summary.expense -= fields.Amount)
//   })
//   return summary
// }

const handleTWFAMessage = async event => {
  let returnText = JSON.stringify(event)
  if (event.message.type === 'text') {
    const dfReturn = await dfProcess(event.message.text)
    console.log(dfReturn.parameters)
    if (
      dfReturn !== 'error' &&
      JSON.stringify(dfReturn.parameter) !== '{"fields":{}}'
    ) {
      returnText = dfReturn.parameters
      return {
        type: 'return',
        object: {
          type: 'text',
          text: JSON.stringify(returnText)
        }
      }
    } else
      return {
        type: 'notmytext',
        object: {}
      }
  }
}

module.exports = handleTWFAMessage
