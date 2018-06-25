# sandstorm-torrent-authentication

Before using this service, You need to have Apache Kafka installed and running.
(refer: https://kafka.apache.org/quickstart).

## Environment Variables used:
KAFKA_BROKERS=localhost:9092,localhost:9093<br/>
MONGO_URL=mongodb://localhost:27017/SandstormDb

Default KAFKA_BROKERS value is localhost:9092<br/>
Default MONGO_URL value is mongodb://localhost:27017/SandstormDb</br>

## Create '2 Topics' in Kafka
topic.authentication.request<br/>
topic.authentication.response

<br/><code>
git clone https://github.com/Evolvus/sandstorm-torrent-authentication.git<br/>
</code><br/>
<code>
cd sandstorm-torrent-authentication
</code>

## Here you  can see 2 services
1.authentication-request-service<br/>
2.authentication-response-service

## Step 1: goto authentication-request-service
<code>cd authentication-request-service && npm install</code><br/>
Here we use environment variable called 'QUEUE' to check authentication again different implementations
Possible values of QUEUE are 



<code>npm start</code><br/>
This should start and listen to 3001,it will connect to Kafka

## Step 2:goto authentication-response-service
<code> cd authentication-response-service && npm i </code><br/>
<code> npm start </code><br/>
This should start and listen to 3002,it will connect to Kafka.<br/>


From user interface you can hit /authenticate request with credentials in body</br>
<code>
curl -X POST -H 'Content-Type: application/json' -i http://localhost:3001/authenticate --data '{
"userName":"shrimank",
"userPassword":"test@123",
"application":"FLUX_CODE",
 "authType":"mongo"
}'
</code><br/>
<br/>
 Here 'authType' possible implementations ldap,mongo & custom.
 Routes Credentials to based on authType value<br/><br/>
  <code>
  'mongo': 'topic.authentication.request.mongo'<br/>
  'ldap': 'topic.authentication.request.ldap'<br/>
  'custom': 'topic.authentication.request.custom'<br/>
  </code>

## How it works :
1.Send user credentials to '/authenticate',request<br/>
2./authenticate reads credentials from request body and published it to 'topic.authentication.request' topic.<br/>
3.From the other side authentication-response-service is subscribed to the 'topic.authentication.request' topic and reads the credentials.<br/>
4.read credentials from 'topic.authentication.request' will be queries to evolvus-user service(npm install evolvus-user) for authentication.<br/>
5.After authenticating, the result will be published to 'topic.authentication.response'.<br/>
6.'/authenticate' api also subscribed to 'topic.authentication.response' the response will be send back to the called client.<br/>



