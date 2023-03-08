const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema( {
    "name": {
        "type": "String",
        "required": true
    },
    "birthday": {
        "type": "String",
        "required": true
    },
    "height": {
        "type": "String",
        "required": true
    },
    "stats": {
        "_uniques": {
            "hp": {},
            "attack": {},
            "defense": {}
        },
        "hp": {'type':"Number", 'required':true},
        "attack":{'type':"Number", 'required':true},
        "defense": {'type':"Number", 'required':true}
    }
})

const Item = mongoose.model('templateCollection', itemSchema)

module.exports = Item