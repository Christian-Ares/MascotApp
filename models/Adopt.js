const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adoptSchema = new Schema({
    Name: {type: String},
    breed: {type: String},
    birthDate: {type: String},
    Gender: {type: String},
    image_name: {type: String},
    image_path: {type: String}
})

const Adopt = mongoose.model('Adopt', adoptSchema)

module.exports = Adopt