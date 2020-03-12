const mongoose = require('mongoose')
const exampleSchema = new mongoose.Schema({
    str: {
        type: String,
    },
    title: {
        type: String
    },
    author: {
        type: String
    },
    date: {
        type: String
    }
})

const PipiExample = mongoose.model('PipiExample', exampleSchema)
module.exports = {
    PipiExample
}