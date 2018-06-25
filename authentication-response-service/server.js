// app.js
var express = require('express');
const PORT = process.env.PORT || 3002;
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sandstormDB';

mongoose.connect(MONGO_URL);


var figlet = require('figlet');
const User = require("evolvus-user").userSchema;
console.log('USER is ', User);

var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.Client(),
    Consumer = kafka.Consumer,
    KeyedMessage = kafka.KeyedMessage,
    producer = new Producer(client);
const topicRequest = 'topic.authentication.request';
const topicResponse = 'topic.authentication.response';

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
app.use(router);
app.listen(PORT, () => {
    console.log(`Authentication Service is Up and listening on port [${PORT}]`);
    console.log('kafka is connecting...You will see [Kafka Connected] message.');
});
figlet('-: Authentication :-', function(err, data) {
    if (err) {
        console.log('Failed to Initialize Evolvus Authentication Service');
        console.dir(err);
        return;
    }
    console.log(data);
});
console.log("Evolvus Authentication Service By  Evolvus,which uses Kafka for asynchronous authentication.");
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Request-Headers", "*");
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,X-HTTP-Method-Override, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

consumer = new Consumer(
    client, [
        { topic: topicRequest, partition: 0 }
    ], {
        autoCommit: true
    }
);


consumer.on('message', function(message) {

    var credentials = JSON.parse(message.value);
    console.log(`Received for authentication in ${topicRequest} data is ${credentials}`);
    User.authenticate(credentials).then(successData => {
        response = { message: successData, status: 200 };
        console.log(`Authenticated data ${JSON.stringify(response)}`);
        var payloads = [
            { topic: topicResponse, messages: JSON.stringify(response), partition: 0 }
        ];
        producer.send(payloads, function(err, data) {
            console.log("Produced after authentication", data);
        });
    }).catch(err => {
        console.log("ERRR", err);
        var payloads = [
            { topic: topicResponse, messages: JSON.stringify(err), partition: 0 }
        ];
        producer.send(payloads, function(err, data) {
            console.log(`Caught exception sent the same to ${topicResponse} errors is ${err}`);
        });
    });

});


producer.on('ready', function() {
    console.log(`[Kafka Connected]`);
});


module.exports = app;