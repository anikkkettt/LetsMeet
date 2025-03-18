const {Router} = require('express');
const { login, register, getUserHistory, addToHistory } = require('../controllers/user.Controller');

const router= Router();

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/get_all_activity").get(getUserHistory)
router.route("/add_to_activity").post(addToHistory)

module.exports= router;