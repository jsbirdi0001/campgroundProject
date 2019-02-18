var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text: String,
    author: String
})

var Comments = mongoose.model("Comments", commentSchema);

module.exports = Comments;