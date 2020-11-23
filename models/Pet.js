const mongoose = require('mongoose')
const Schema = mongoose.Schema

const petSchema = new Schema({
    name: {type: String, required: true},
    chipId: {type: Number, required: true},
    age: {type: Number},
    gender: {type: String, required: true},
    hairColor: {type: String, required: true},
    //Image: {type: Image}
})

const Pet = mongoose.model('Pet', petSchema)

module.exports = Pet