const mongoose = require("mongoose")

const chatIoSchema = mongoose.Schema({
    name: String,
    secret: String
})

const tracksSchema = mongoose.Schema({
    sid: String,
    name: String,
    artists: [String]
})

const audioFeatureSchema = mongoose.Schema({
    danceability: String,
    energy: String,
    key: String,
    loudness: String,
    mode: String,
    speechiness: String,
    acousticness: String,
    instrumentalness: String,
    liveness: String,
    valence: String,
    tempo: String,
})

const playlistSchema = mongoose.Schema({
    sid: String,
    name: String
})

const schema = mongoose.Schema({
    user_id: String,
    user_name: String,
    user_email: String,
    access_token: String,
    refresh_token: String,
    token_type: String,
    scope: String,
    playlists: [playlistSchema],
    audio_features: audioFeatureSchema,
    tracks: [tracksSchema],
    chatio: chatIoSchema
})

const User = mongoose.model("user", schema)
module.exports = {
    User
}