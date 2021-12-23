const express = require('express')
const cors = require("cors")
const { connectDB } = require('./configs/db')
const { greetingsRouter } = require('./routes/greetings')
const { authRouter } = require('./routes/authentication')
const { verifyUser } = require('./middlewares/verify_user')
const { userRouter } = require('./routes/user')
const { streamsRouter } = require('./routes/streams')
const { chatRouter } = require('./routes/chats')

// app setup
const app = express()

// db setup
connectDB()

// middleware setup
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("", greetingsRouter)
app.use("/auth", authRouter)
app.use("/user", verifyUser, userRouter)
app.use("/streams", verifyUser, streamsRouter)
app.use("/chat", verifyUser, chatRouter)

module.exports = {
    app
}