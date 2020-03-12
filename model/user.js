const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 10
    },
    password: {
        type: String,
        required: true,

    }
})

const PipiUser = mongoose.model('PipiUser', userSchema)

// PipiUser.create({
//     username: 'pipi',
//     password: '123456'
// })

module.exports = {
    PipiUser: PipiUser
}