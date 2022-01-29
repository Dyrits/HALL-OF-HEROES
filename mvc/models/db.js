const mongoose = require("mongoose");

let uri = "mongodb://localhost/supers";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, () => { console.log("...")});

mongoose.connection.on("connected", () => {
    console.log(`Mongoose successfully connected to ${uri}.`)
})

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected.');
});

const shutdown = (msg, callback) => {
    mongoose.connection.close( () => {
        console.log(`Mongoose disconnected through ${msg}.`);
        callback();
    });
};

process.once('SIGUSR2', () => {
    shutdown('Restarting Nodemon...', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});

process.on('SIGINT', () => {
    shutdown('App termination...', () => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    shutdown('Heroku app shutting down...', () => {
        process.exit(0);
    });
});

require("./heroes");