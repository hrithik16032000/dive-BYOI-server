const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const generateRandom = () => {
    return crypto.randomBytes(12).toString("hex")
}

const generateToken = (email_id) => {
    return jwt.sign({ email_id }, process.env.SECRET, { expiresIn: "1h" })
}

module.exports = {
    generateRandom,
    generateToken
}