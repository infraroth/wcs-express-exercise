const jwt = require('jsonwebtoken');

const privateKey = process.env.PRIVATE_KEY

const calculateToken = (userEmail = "", userId = "") => {
    return jwt.sign({email: userEmail, user_id: userId}, privateKey)
}

module.exports = { calculateToken };