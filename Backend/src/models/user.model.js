const { Schema, default: mongoose } = require("mongoose");


const UserSchema= new Schema({
    name: {type:String, required:true},
    username: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    token: {type:String}
})

const User=mongoose.model("User",UserSchema)
module.exports={User}