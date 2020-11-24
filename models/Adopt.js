const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adoptSchema = new Schema({
    Name: {type: String},
    breed: {type: String},
    birthDate: {type: String},
    Gender: {type: String},
    //Image: {type: Image}
})

const Adopt = mongoose.model('Adopt', adoptSchema)

module.exports = Adopt