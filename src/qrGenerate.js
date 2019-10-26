const { Storage } = require('@google-cloud/storage')
const storage = new Storage()

require('dotenv').config()

const sharp = require('sharp')
const link = 'promptpay-image'

const bucket = storage.bucket(link)

// storage
//   .getBuckets()
//   .then(results => {
//     const buckets = results[0]

//     console.log('Buckets:')
//     buckets.forEach(bucket => {
//       console.log(bucket.name)
//     })
//   })
//   .catch(err => {
//     console.error('ERROR:', err)
//   })

const promptpayQr = async amount => {
  const qrcode = require('qrcode')
  const generatePayload = require('promptpay-qr')

  const mobileNumber = '090-930-3284'
  const payload = generatePayload(mobileNumber, { amount })

  const options = {
    type: 'svg',
    color: { dark: '#000000', light: '#ffffff' }
  }
  const result = await new Promise((resolve, reject) => {
    qrcode.toString(payload, options, (err, svg) => {
      if (err) return reject(err)
      resolve(svg)
    })
  })
  return result
}

const qrGenerate = async amount => {
  const svg = await promptpayQr(amount)
  const svgBuffer = Buffer.from(svg)
  sharp(svgBuffer)
    .pipe(
      bucket.file(`${amount}.png`).createWriteStream({
        resumable: false,
        validation: false,
        contentType: 'auto',
        metadata: {
          'Content-Dispositions': 'attachment',
          'Content-Type': 'image/png'
        }
      })
    )
    .on('error', err => console.log(err))
    .on('finish', () => console.log('finished'))
  return `https://storage.googleapis.com/${link}/${amount}.png`
}

module.exports = qrGenerate
