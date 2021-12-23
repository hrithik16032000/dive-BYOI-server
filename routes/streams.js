const { getRefreshToken } = require("../controllers/authentication")
const { getPlaylists, getRecentPlayed } = require("../controllers/streams")
const { User } = require("../models/user")
const { default: axios } = require("axios")
const config = require("../config.json")

const streamsRouter = require("express").Router()

streamsRouter.get("/playlists", (req, res, next) => {
    return getPlaylists(req)
        .then(doc => {
            return res.status(200).json({
                success: true,
                data: doc
            })
        })
        .catch(err => {
            console.error("routes/streams/getplaylists -", err.toString())

            if (err.toString() == "Error: Request failed with status code 401") {
                getRefreshToken(req, res, next)
                return res.status(400).json({
                    success: false,
                    error: err.toString(),
                    message: 'spotify access failure, refresh after few seconds'
                })
            }

            return res.status(400).json({
                success: false,
                error: err.toString(),
                message: 'spotify playlist fetch failed'
            })
        })
})

streamsRouter.get("/recent", (req, res, next) => {
    return getRecentPlayed(req)
        .then(data => {
            return res.status(200)
                .json({
                    success: true,
                    vibes: data.doc.audio_features,
                    tracks: data.trackNames
                })
        })
        .catch(err => {
            console.error("routes/streams/getrecent -", err.toString())

            if (err.toString() == "Error: Request failed with status code 401") {
                getRefreshToken(req, res, next)
                return res.status(400).json({
                    success: false,
                    error: err.toString(),
                    message: 'spotify access failure, refresh after few seconds'
                })
            }

            return res.status(400).json({
                success: false,
                error: err.toString(),
                message: 'spotify recent fetch failed'
            })
        })
})

const getPlaylistTracks = (req, playlist_id) => {
    return axios.get(`${config.spotify.api}/v1/playlists/${playlist_id}/tracks`, {
        headers: {
            "Authorization": `Bearer ${req.spotify_token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
        .then((response) => {
            return response.data.items.map(item => {
                return {
                    sid: item.track.id,
                    name: item.track.name,
                    artists: item.track.artists.map(art => art.name)
                }
            })
        })
        .then(data => {
            return User.findOneAndUpdate(
                { user_email: req.user_email },
                { $set: { tracks: data } },
                { new: true, projection: "tracks user_email" }
            )
        })
}

streamsRouter.get("/tracks", (req, res, next) => {
    return User.findOne({ user_email: req.user_email })
        .then(doc => {
            const promiseArray = doc.playlists.map(pl => {
                return getPlaylistTracks(req, pl.sid)
            })
            return Promise.all(promiseArray)
        })
        .then(response => {
            return User.findOne({ user_email: req.user_email }, { tracks: 1 })
        })
        .then(doc => {
            return res.status(200).json({
                success: true,
                tracks: doc.tracks
            })
        })
        .catch(err => {
            console.error("routes/streams/gettracks -", err.toString())

            if (err.toString() == "Error: Request failed with status code 401") {
                getRefreshToken(req, res, next)
                return res.status(400).json({
                    success: false,
                    error: err.toString(),
                    message: 'spotify access failure, refresh after few seconds'
                })
            }

            return res.status(400).json({
                success: false,
                error: err.toString(),
                message: 'spotify tracks fetch failed'
            })
        })
})

module.exports = {
    streamsRouter
}