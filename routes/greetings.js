const { createChatIoUser } = require("../controllers/authentication")

const greetingsRouter = require("express").Router()

greetingsRouter.get('/greetings', (req, res, next) => {
    return res
        .status(200)
        .json({
            success: true,
            message: 'Hello World',
            data: {}
        })
})

module.exports = {
    greetingsRouter
}