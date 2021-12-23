const { default: axios } = require("axios")
const config = require("../config.json")
const { User } = require("../models/user")

const getPlaylists = (req) => {
    return axios.get(`${config.spotify.api}/v1/me/playlists`, {
        headers: {
            "Authorization": `Bearer ${req.spotify_token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
        .then(response => {
            console.info(`controllers/streams/getplaylists - `, response.data)
            const ps = response.data.items.map(item => {
                return {
                    name: item.name,
                    sid: item.id
                }
            })
            return User.findOneAndUpdate({ user_email: req.user_email },
                { $set: { playlists: ps } },
                { new: true, projection: "user_name user_email playlists" }
            )
        })
        .then(doc => {
            if (!doc) throw Error('document is null')
            return doc
        })

}

const getRecentPlayed = (req) => {
    var trackNames =[]
    var hashData = {
        danceability: 0,
        energy: 0,
        key: 0,
        loudness: 0,
        mode: 0,
        speechiness: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        valence: 0,
        tempo: 0,
    }
    return axios.get(`${config.spotify.api}/v1/me/player/recently-played`, {
        headers: {
            "Authorization": `Bearer ${req.spotify_token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
        .then(response => {
            if (response.data.items) {
                trackNames = response.data.items.map(it => it.track.name)
                var ids = ""
                response.data.items.map(item => ids = ids + "," + item.track.id)

                return axios.get(`${config.spotify.api}/v1/audio-features?ids=${ids}`, {
                    headers: {
                        "Authorization": `Bearer ${req.spotify_token}`,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                })
            }
            return false
        })
        .then(response => {
            if (!response) throw Error('unable to sync recent tracks')
            var count = 0
            response.data.audio_features.map(item => {
                if (item) {
                    count += 1
                    hashData.danceability = hashData.danceability + item.danceability
                    hashData.acousticness = hashData.acousticness + item.acousticness
                    hashData.energy = hashData.energy + item.energy
                    hashData.instrumentalness = hashData.instrumentalness + item.instrumentalness
                    hashData.key = hashData.key + item.key
                    hashData.liveness = hashData.liveness + item.liveness
                    hashData.mode = hashData.mode + item.mode
                    hashData.loudness = hashData.loudness + item.loudness
                    hashData.speechiness = hashData.speechiness + item.speechiness
                    hashData.tempo = hashData.tempo + item.tempo
                    hashData.valence = hashData.valence + item.valence
                }
            })
            for (key of Object.keys(hashData)) {
                hashData[key] = (hashData[key] / count).toFixed(3)
            }
            return User.findOneAndUpdate(
                { user_email: req.user_email },
                { $set: { audio_features: hashData } },
                { new: true, projection: "user_name user_email audio_features" }
            )
        })
        .then(doc => {
            if (!doc) throw Error('document not found')
            return {
                doc,
                trackNames
            }
        })
}

module.exports = {
    getPlaylists,
    getRecentPlayed
}