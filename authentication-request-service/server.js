// app.js
var express = require('express');
const PORT = process.env.PORT || 3001;
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';

var figlet = require('figlet');

var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.KafkaClient({ kafkaHost: KAFKA_BROKERS }),
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
    console.log(`kafka is connecting...${KAFKA_BROKERS}`);
    console.log('You will see [Kafka Connected] message.');
});


figlet('-: Authentication API :-', function(err, data) {
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
        { topic: topicResponse, partition: 0 }
    ], {
        autoCommit: true
    }
);


// Authenticate User with their credentials.
router.post('/authenticate', function(req, res) {
    console.log(`/authenticate request hit ${req.body}`);
    var credentials = {
        userName: req.body.userName,
        userPassword: req.body.userPassword,
        application: req.body.application
    };
    console.log(credentials);
    var payloads = [
        { topic: topicRequest, messages: JSON.stringify(credentials), partition: 0 }
    ];
    producer.send(payloads, function(err, data) {
        consumer.on('message', function(message) {
            console.log('On Receiveing ', message);
            res.status(200).send({ message: message });
            //consumer.commit();
        });
    });

});



producer.on('ready', function() {
    console.log(`[Kafka Connected]`);
});


module.exports = app;