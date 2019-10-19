const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000

app.post('/webhook', (req,res) => res.sendStatus(200))
app.listen(PORT, () => {
    console.log(`app listen on port ${PORT}`)
})