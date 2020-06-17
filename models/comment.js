const mongoose = require("mongoose")

var commentSchema = mongoose.Schema(
    {
        text: String,
        gameId: String,
        created: Date,
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                // The reference is from where we are going to obtain the ID, in this case user
                ref: "User"
            },
            username: String
        }
    })
module.exports = mongoose.model("Comment", commentSchema)