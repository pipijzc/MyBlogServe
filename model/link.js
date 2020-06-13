const mongoose = require('mongoose')
const LinkSchema = new mongoose.Schema({
    username: {
        type: String
    },
    url: {
        type: String
    },
    logo: {
        type: String
    }
})


const Link = mongoose.model('link', LinkSchema)


module.exports = {
    Link
}