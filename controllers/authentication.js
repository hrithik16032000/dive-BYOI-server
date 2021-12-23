const { default: axios } = require("axios")
const { User } = require("../models/user")
const config = require("../config.json")
const querystring = require("querystring")
const crypto = require("crypto")

const getRefreshToken = (req, res, next) => {
    return User.findOne({ user_email: req.user_email })
        .then(doc => {
            const data = {
                grant_type: 'refresh_token',
                refresh_token: doc.refresh_token,
                client_id: process.env.SPOITFY_CLIENT_ID,
                client_secret: process.env.SPOITFY_CLIENT_SECRET
            }
            return axios.post(`${config.spotify.url}/api/token`, querystring.stringify(data), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                }
            })
        })
        .then(response => {
            return User.findOneAndUpdate(
                { user_email: req.user_email },
                { $set: { access_token: response.data.access_token } },
            )
        })
        .then(doc => {
            if (!doc) throw Error(`document not found in DB - ${req.user_email}`)
            return true
        })
        .catch(err => {
            if (err) console.log(`controller - refresh token - failed -${err}`)
            return false
        })
}

const createChatIoUser = (email_id) => {
    console.log(email_id)
    return User.findOne({ user_email: email_id }, { chatio: true, user_name: true })
        .then(doc => {
            console.log(doc)
            if (!doc) throw Error("user not found")
            if (doc.chatio && doc.chatio.name && doc.chatio.secret) return false
            return doc
        })
        .then((doc) => {
            if (doc) {
                const chatio = {
                    name: doc.user_name.replace(/\s/g, "_").toLowerCase(),
                    secret: doc.user_name.replace(/\s/g, crypto.randomBytes(2).toString("hex")).toLowerCase()
                }
                console.log(chatio, process.env.CHAT_PROJECT_SECRET, process.env.CHAT_PROJECT_ID)
                return axios.post("https://api.chatengine.io/users/",
                    {
                        "username": chatio.name,
                        "secret": chatio.secret,
                    }, {
                    headers: {
                        'Private-Key': process.env.CHAT_PROJECT_SECRET,
                        'Project-ID': process.env.CHAT_PROJECT_ID,
                    }
                })
                    .then(response => {
                        if (response.data) {
                            return User.findOneAndUpdate({ user_email: email_id }, {
                                $set: {
                                    chatio
                                }
                            })
                        }
                    })
                    .catch((err) => {
                        console.log(err.toJSON())
                        console.error("controllers/auth/chatio - ", err.toString())
                    })
            }
        })
}
module.exports = {
    getRefreshToken,
    createChatIoUser
}