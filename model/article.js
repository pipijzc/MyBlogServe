const mongoose = require('mongoose');
const articleSchema = new mongoose.Schema({
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
    },
    introduct: {
        type: String
    },
    category: {
        type: String
    }
})

const PipiArticle = mongoose.model('PipiArticle', articleSchema)

// PipiUser.create({
//     username: 'pipi',
//     password: '123456'
// })

module.exports = {
    PipiArticle: PipiArticle
}