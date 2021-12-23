const userRouter = require("express").Router()
const { User } = require("../models/user")

userRouter.get('/profile', (req, res, next) => {
    return User.findOne({ user_email: req.user_email }, {
        user_email: true, user_name: true, playlists: true
    })
        .then(doc => {
            if (!doc) throw Error('user data not found')
            return res.status(200)
                .json({
                    success: true,
                    profile: doc.toJSON()
                })
        })
        .catch(err => {
            console.error(`routes - users - error - ${err}`)
            return res.status(200)
                .json({
                    success: false,
                    message: 'user profile fetch failed',
                    error: err.toString()
                })
        })
})

module.exports = {
    userRouter
}