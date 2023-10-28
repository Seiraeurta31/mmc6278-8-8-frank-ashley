const { Schema } = require('mongoose');

const CommentSchema = new Schema({
// Create an "author" property with type String and default of 'Anonymous'
author: {
    type: String,
    default: ("Anonymous")
},
// Create a "body" property with type String and make it required
body: {
    type: String,
    required: true
},
// Create a "createdAt" property with type Date and set default to Date.now
createdAt: {
    type: Date,
    default: Date.now()
}
})

module.exports = CommentSchema
