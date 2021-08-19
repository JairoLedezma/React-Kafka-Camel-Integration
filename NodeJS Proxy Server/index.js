const express = require('express');
const app = express();
const cors = require('cors');
const { Kafka } = require('kafkajs');

// Client configuration, at least one broker needed, 3 are recommended
const kafka = new Kafka({
  brokers: ['localhost:9092']
});

// Topic strings for REST Requests Pool and Reponse Pool
const REST_REQUEST_POOL = "requestPool";
const REST_RESPONSE_POOL = "responsePool";

// Producer and Consumer objects
const consumer = kafka.consumer({ groupId: 'responsePool-Group' });
const producer = kafka.producer();

app.use(cors());
app.use(express.json());

app.get('/connect', async (req, res) => {

    await consumer.connect();
    await producer.connect();

    await consumer.subscribe({ topic: REST_RESPONSE_POOL, fromBeginning: false })

    // Topics Consumer
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {

            // reponsePool Consumer
            if(topic.toString() === REST_RESPONSE_POOL) {
                if(UserRequestsHashMap[message.key]){
                    UserRequestsHashMap[message.key].status(200).send(`HTTP Request with Id ${message.key} processed:\n` + message.value.toString());
                    UserRequestsHashMap[message.key].end();
                    delete UserRequestsHashMap[message.key];

                    console.log(`\x1b[32mHTTP Request with Id: ${message.key} consumed from responsePool Topic and has been Processed\n\x1b[0m`);
                }
                else{
                    console.log(`\x1b[31mHTTP Request Id: ${message.key} is not present in cache and Response Object has been discarded\n\x1b[0m`);
                }
            }
        },
    });
    
    console.log('\n\n\n');

    res.status(200).send("Connection Started");
    res.end();
});

app.get('/disconnect', async (req, res) => {

    await consumer.disconnect();
    await producer.disconnect() 

    console.log('\n\n\n');

    res.status(200).send("Connection Ended");
    res.end();
});

var UserRequestsHashMap = {};
app.post('/send', async (req, res) => {

    let Msg = "Failed";
    if(req.body){
        Msg = JSON.stringify(req.body);
    }
    else{
        res.status(403).send(`Bad Request`);
        res.end();
    }

    let id = Math.floor(Math.random() * 100000);

    console.log(`\x1b[32mHTTP Request with Id: ${id} sessionObject cached\x1b[0m`);
    await producer.send({
        topic: REST_REQUEST_POOL,
        messages: [
          { key: id.toString(), value: Msg.toString() },
        ],
    })
    console.log(`\x1b[36mHTTP Request with Id: ${id} is added to requestPool Topic and is being Processed...\x1b[0m`);
    
    UserRequestsHashMap[id] = res;
});

app.listen(8088, () => {
    console.log('Listening on port 8088');
});