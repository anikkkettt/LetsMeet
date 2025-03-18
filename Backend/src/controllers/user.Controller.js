const bcrypt= require('bcryptjs')
const {hash}= require('bcryptjs');
const { User } = require('../models/user.model.js');
const crypto= require('crypto')
const { Meeting } = require('../models/meeting.model.js');


const register= async(req,res) =>
{
    const {name, username, password} = req.body;

    if(!name || !username || !password){ return res.status(400).json({msg: "Input field empty"})}

    try{
        const user= await User.findOne({username})
        if(user){
            return res.status(302).json({msg: "User already exists"});
        }

        const hashedpass= await bcrypt.hash(password,10)
        const newUser= new User({
            name:name,
            username:username,
            password: hashedpass
        })

        await newUser.save()
        res.status(201).json({msg: "User succesfully registered"})

    }
    catch(e){
        res.json({msg: `Error: ${e}`})
    }
}

const login= async(req,res) =>{
    const {username, password} = req.body

    if(!username || !password) {return res.status(400).json({msg: "Input field empty"}) }

    try{
        const user= await User.findOne({username})

        if(!user){ return res.status(404).json({msg: "User not found"})}

        let isPassCorrect= await bcrypt.compare(password, user.password)

        if(isPassCorrect){
            let token= crypto.randomBytes(20).toString("hex")
            user.token= token
            await user.save()
            return res.status(200).json({ token: token })
        }
        else{
            return res.status(401).json({ msg: "Invalid Username or password" })
        }
    }
    catch(e){
        return res.status(500).json({ msg: `Something went wrong ${e}` })
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ userid: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ msg: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            userid: user.username,
            meetingcode: meeting_code
        })

        await newMeeting.save();

        res.status(201).json({ msg: "Added code to history" })
    } catch (e) {
        res.json({ msg: `Something went wrong ${e}` })
    }
}

module.exports ={login, register, getUserHistory, addToHistory}