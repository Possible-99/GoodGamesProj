const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose")

var UserSchema = mongoose.Schema({
    username: String,
    password: String,
    registerDate: Date
})
//We give to the User all the methods that we need(like User,Register, that is for register the user in the DB, and encode the password).
UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", UserSchema)