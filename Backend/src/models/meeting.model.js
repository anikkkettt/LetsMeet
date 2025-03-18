const { Schema, default: mongoose } = require("mongoose");


const meetingSchema=new Schema({
    userid: {type:String, required:true},
    meetingcode:{type:String, required:true},
    date: {type:Date, default:Date.now, required:true}
})

const Meeting= mongoose.model("Meeting", meetingSchema)
module.exports= {Meeting}