const { Schema, model, models } = require('mongoose');

const TagSchema = new Schema({
// Create a name property with type String and make it required and unique
name: {
    type: String,
    required: true,
    unique: true
}
})

module.exports = models.Tag || model('Tag', TagSchema)
