const authRouter = require('express').Router()
const { default: axios } = require('axios')
const querystring = require("querystring")
const config = require("../config.json")
const { User } = require('../models/user')
const { generateRandom, generateToken } = require('../utils/helpers')
const { verifyUser } = require("../middlewares/verify_user")
const { getRefreshToken, createChatIoUser } = require('../controllers/authentication')


authRouter.get('/login', (req, res, next) => {
    const URL =
        `${config.spotify.url}/authorize?client_id=${process.env.SPOITFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=${config.spotify.scopes}&show_dialog=true`
    res
        .status(200)
        .json({
            success: true,
            url: URL
        })
})

authRouter.get('/callback', (req, res, next) => {
    const accessData = {}

    const data = {
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URI,
        code: req.query.code,
        client_id: process.env.SPOITFY_CLIENT_ID,
        client_secret: process.env.SPOITFY_CLIENT_SECRET
    }

    axios.post(`${config.spotify.url}/api/token`, querystring.stringify(data), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        }
    })
        .then(res => {
            accessData.access_token = res.data.access_token
            accessData.refresh_token = res.data.refresh_token
            accessData.token_type = res.data.token_type
            accessData.scope = res.data.scope

            return axios.get(`${config.spotify.api}/v1/me`, {
                headers: {
                    "Authorization": `Bearer ${accessData.access_token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
        })
        .then((userRes) => {
            const newUser = {
                access_token: accessData.access_token,
                refresh_token: accessData.refresh_token,
                token_type: accessData.token_type,
                scope: accessData.scope,
                user_id: generateRandom(),
                user_name: userRes.data.display_name,
                user_email: userRes.data.email,
            }

            return User.findOneAndUpdate(
                { user_email: userRes.data.email },
                newUser,
                { upsert: true, new: true }
            )
        })
        .then((doc) => {
            if (!doc) throw Error(`user login failed - unable to save user data`)
            createChatIoUser(doc.user_email)
            return res
                .redirect(`http://localhost:3000/profile?jtoken=${generateToken(doc.user_email)}`)
        })
        .catch(err => {
            console.log("oauth callback error - ", err)
            return res.status(400)
                .json({
                    success: false,
                    error: err.toString(),
                    message: "login failed"
                })
        })
})

authRouter.get('/refresh_token', verifyUser, (req, res, next) => {
    getRefreshToken(req, res, next)
        .then(truthy => {
            if (truthy)
                return res.status(200)
                    .json({
                        success: true,
                    })
            return res.status(400).json({
                success: false,
                error: 'something went wrong'
            })
        })
        .catch(err => {
            return res.status(400).json({
                success: false,
                error: err.toString()
            })
        })
})

module.exports = {
    authRouter
}