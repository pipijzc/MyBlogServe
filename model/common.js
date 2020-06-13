const mongoose = require('mongoose');
const CommonSchema = new mongoose.Schema({
    username: {
        type: String
    },
    content: {
        type: String
    },
    time: {
        type: String
    },
    replay: {
        type: String
    }
})


const Common = mongoose.model('Common', CommonSchema)


module.exports = {
    Common
}