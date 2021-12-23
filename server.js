const { app } = require('./app')
const dotenv = require('dotenv')

dotenv.config({
    path: process.env.NODE_ENV == "prod" ? ".env" : ".dev.env"
})

const server = app.listen(process.env.PORT, (err) => {
    if (err) throw Error(`server is unable to start - ${err}`)
    console.log(`server running on port ${process.env.PORT}`)
})

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received')
    server.close((err) => {
        if (err) {
            console.log(`server shut down with error - ${err}`)
            // failure exit
            process.exit(1)
        }
        console.log("graceful server shutdown")
    })
    // success exit
    process.exit(0)
})