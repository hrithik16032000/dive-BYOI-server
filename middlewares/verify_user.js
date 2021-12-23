const jwt = require("jsonwebtoken")
const { User } = require("../models/user")

const verifyUser = (req, res, next) => {
    const decode = jwt.decode(req.headers.authorization, process.env.SECRET)

    if (decode && decode.email_id)
        return User.findOne({ user_email: decode.email_id })
            .then(doc => {
                if (!doc) return res.status(401).json({
                    success: false,
                    message: 'authentication failed',
                    error: "user not found"
                })
                req.user_email = doc.user_email
                req.spotify_token = doc.access_token
                next()
            })
    else return res.status(401).json({
        success: false,
        message: "authentication failed",
        error: "invalid access token"
    })
}

module.exports = {
    verifyUser
}