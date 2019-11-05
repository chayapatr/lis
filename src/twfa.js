const dfProcess = require('./dfProcess')

const Airtable = require('airtable')
const moment = require('moment')
require('dotenv').config()

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.TWFA_AIRTABLE_BASE)

const table = 'Accounting'

const addRecord = async (name, cat, total) => {
  const d = new Date()
  const date = moment(d).format('YYYY-MM-DD')
  const link = {
    รายรับ: 'recARQLhc3rjphECl',
    สถานที่: 'recOO3bQTqrqTFbne',
    ระบบเสียงและแสง: 'recl5nmI72srw4GJk',
    ทีมงานช่วยฝึกซ้อมการแสดง: 'recabdODhRiWyIyEi',
    สวัสดิการทีมงานและนักแสดง: 'rectiTgvc06GQ6MaP',
    'สื่อ(บัตรละครและสูจิบัตร)': 'recQw03tU7eAClATK',
    อุปกรณ์และเครื่องประกอบฉาก: 'recgcYYOYFcKN3E1X',
    อุปกรณ์และเสื้อผ้าประกอบการแสดง: 'recbhZRD3D154n4HV',
    ค่าใช้จ่ายอื่นๆ: 'recrCaDwlS8UV34ue'
  }
  const create = base(table).create(
    [
      {
        fields: {
          Name: name,
          Date: date,
          Category: cat,
          Link: [link[cat]],
          Total: total,
          Note: ''
        }
      }
    ],
    (err, records) => {
      if (err) {
        console.error(err)
        return
      }
      records.forEach(function(record) {
        console.log(record.getId())
      })
    }
  )
  return create
}

const handleTWFAMessage = async event => {
  let returnText = JSON.stringify(event)
  const ด่า = require('./ด่า')
  console.log(event.message.text)
  if (event.message.text === 'อีกระเทย') {
    return {
      type: 'return',
      object: {
        type: 'text',
        text: 'มึงสิอีกระเทย'
      }
    }
  } else if (event.message.text === 'อีปาราชิก') {
    return {
      type: 'return',
      object: {
        type: 'text',
        text: 'กูจะแจ้งๆ'
      }
    }
  } else if (event.message.text === 'ใคร') {
    return {
      type: 'return',
      object: {
        type: 'text',
        text: 'ใครถาม'
      }
    }
  } else if (event.message.text === 'ใคร') {
    return {
      type: 'return',
      object: {
        type: 'text',
        text: 'ใครถาม'
      }
    }
  } else if (event.message.text === 'น้อง ไปตาย') {
    return {
      type: 'return',
      object: {
        type: 'text',
        text: 'แง'
      }
    }
  } else if (event.message.text.includes('ประยุทธ์')) {
    return {
      type: 'return',
      object: {
        type: 'text',
        text: ด่า.ปลาหยุด[Math.floor(Math.random() * ด่า.ปลาหยุด.length)]
      }
    }
  } else if (event.message.text.includes('ด่า')) {
    return {
      type: 'return',
      object: {
        type: 'text',
        text: ด่า.ด่า[Math.floor(Math.random() * ด่า.ด่า.length)]
      }
    }
  } else if (event.message.text === 'น้อง test') {
    return {
      type: 'return',
      object: {
        type: 'text',
        text: JSON.stringify(event)
      }
    }
  }
  if (event.message.text.includes('น้อง')) {
    const dfReturn = await dfProcess(event.message.text)
    if (
      dfReturn.intent.displayName === 'น้อง' &&
      JSON.stringify(dfReturn.parameters) !== '{"fields":{}}'
    ) {
      const fields = dfReturn.parameters.fields
      const number = fields.number.listValue.values
      returnText = fields
      let name = fields.any.stringValue || fields['n-type'].stringValue
      let cat = fields['n-type'].stringValue
      let total
      if (cat !== '' && (number !== undefined || number.length !== 0)) {
        if (cat === 'อาหาร') {
          cat = 'สวัสดิการทีมงานและนักแสดง'
          name = 'ค่าอาหาร'
        }
        if (fields['n-type'] === 'รายรับ') {
          total = number[0].numberValue
        } else {
          total = -number[0].numberValue
        }
        returnText =
          'รายการ: ' +
          name +
          ' ประเภท: ' +
          cat +
          ' รวม: ' +
          Math.abs(total) +
          ' บาท'
        addRecord(name, cat, total)
      }
      return {
        type: 'return',
        object: {
          type: 'text',
          text: returnText
        }
      }
    } else
      return {
        type: 'notmytext',
        object: {}
      }
  } else
    return {
      type: 'notmytext',
      object: {}
    }
}

module.exports = handleTWFAMessage
