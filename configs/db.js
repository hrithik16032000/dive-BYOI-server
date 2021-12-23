const mongoose = require("mongoose")
const config = require("../config.json")

const connectDB = () => {
    mongoose.connect(config.db.uri, {}, (err) => {
        if (err) {
            console.log(`unable to connect mongodb - ${err}`)
            process.exit(1)
        }
        console.log(`mongodb connection established`)
    })
}

module.exports = {
    connectDB
}