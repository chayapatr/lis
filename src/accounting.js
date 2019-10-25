const Airtable = require('airtable')
require('dotenv').config()

const base = new Airtable({
  apiKey: process.env.airtableapiKey
}).base('appXA4yG3JmWsx2KA')

const table = 'Income/Expense'

const accounting = async (name, tag, date, price) => {
  // const d = new Date()
  // const date = moment(d).format('YYYY-MM-DD')
  base(table).create(
    [
      {
        fields: {
          Name: name,
          Tag: tag,
          Date: date, // '2019-10-24'
          Price: price
        }
      }
    ],
    (err, records) => {
      if (err) {
        console.error(err)
        return
      }
      records.forEach(record => {
        console.log(record.getId())
      })
    }
  )
}

base(table)
  .select({
    // Selecting the first 3 records in Main View:
    maxRecords: 20,
    view: 'Grid view'
  })
  .eachPage(
    function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(record => {
        console.log('Retrieved', record.fields)
      })

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage()
    },
    function done(err) {
      if (err) {
        console.error(err)
      }
    }
  )

module.exports = accounting
