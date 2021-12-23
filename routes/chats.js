const chatRouter = require("express").Router()
const { User } = require("../models/user")

chatRouter.get('/generate', (req, res, next) => {
    return User.find({}, { user_name: 1, user_email: 1, audio_features: 1, chatio: 1 })
        .limit(20)
        .then(docs => {
            const self = docs.splice(docs.findIndex(user => user.user_email == req.user_email), 1)[0]
            const others = docs
            var rand

            if (process.env.RANDOM_FLAG) {
                rand = Math.floor(Math.random() * others.length)
                return {
                    self: { email: req.user_email, name: self.user_name, chatio: self.chatio },
                    other: { email: others[rand].user_email, name: others[rand].user_name, chatio: others[rand].chatio }
                }
            }
            return false
        })
        .then(pairs => {
            if (!pairs) throw Error('pair generated false')

            return res.status(200).json({
                success: true,
                message: "pair generated successfully",
                pairs
            })
        })
        .catch(err => {
            return res.status(200).json({
                success: false,
                message: "pair generation failed",
                error: err.toString()
            })
        })
})

module.exports = {
    chatRouter
}