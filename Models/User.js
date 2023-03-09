const mongoose = require('mongoose')

const userSchema = new mongoose.Schema( {
    "username": {
        "type": "String",
        "required": true
    },

    "email": {
        "type": "String",
        "required": true
    },

    "password": {
        "type": "String",
        "required": true
    }
})

const User = mongoose.model('userCollection', userSchema)

module.exports = User