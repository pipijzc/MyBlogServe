const mongoose = require('mongoose');
const StarSchema = new mongoose.Schema({
    num: {
        type: Number
    }
})

const Star = mongoose.model('Star', StarSchema)

// Star.create({
//     num: 6
// })
module.exports = {
    Star
}