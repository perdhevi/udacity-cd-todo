import { S3Event, SNSHandler, SNSEvent } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();

const connectionTable = process.env.CONNECTIONS_TABLE;
const ImagesTable = process.env.IMAGES_TABLE;
const stage = process.env.STAGE;
const apiId = process.env.API_ID;

const todoTable = process.env.TODO_TABLE;

const _now = new Date();

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);


export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS Event' , JSON.stringify(event));

    for(const snsRecord of event.Records ){
        const s3EventStr = snsRecord.Sns.Message;

        console.log('Processing S3 Event' , JSON.stringify(s3EventStr));

        const s3Event = JSON.parse(s3EventStr);
        await processS3Event(s3Event);

    }
}

async function updateTable(_todoId, url){
    //find the todo item
    console.log('-----updating todo table-----');
    console.log('find : ',_todoId);
    const queryRest = await docClient.query({
        TableName: todoTable,
        KeyConditionExpression: 'todoId = :paritionKey' ,
        ExpressionAttributeValues: {
          ':paritionKey': _todoId
        }
      })
      .promise();        

      if(queryRest.Count === 0 ){
          console.log('Nooooo');
          return
      }else{
        console.log('found and running update')
        await docClient.update({
            TableName: todoTable,
            Key: { 'todoId': _todoId,
              'userId' : queryRest.Items[0].userId
            },
            ExpressionAttributeValues: {
              ':attachmentUrl' : url
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl', 
        
            ReturnValues:"UPDATED_NEW"
          }).promise()          
      }

}

//export const handler: S3Handler = async ( event: S3Event ) => {
async function processS3Event( s3Event: S3Event)  {
    for ( const record of s3Event.Records) {
        const key = record.s3.object.key
        console.log("processing key ", record.s3.object);

        //populate the image todo

        const newItem = {
            todoId : key,
            timestamp : _now.toISOString(),
            imageId : key,
            attachmentUrl: `https://${record.s3.bucket.name}.s3.amazonaws.com/${key}`
        }

        await docClient.put({
            TableName: ImagesTable,
            Item: newItem
          }).promise().then(res => res).catch(err => console.log(err));

        await updateTable(key,`https://${record.s3.bucket.name}.s3.amazonaws.com/${key}`);

        console.log("Processing websocket");
        console.log(JSON.stringify(connectionParams));

        const connections = await docClient.scan({
            TableName: connectionTable
        }).promise()

        const payload = {
            imageId : key
        }

        for (const connection of connections.Items){
            const connectionId = connection.id;

            await sendMessageToClient(connectionId, payload)
        }


    }
}


async function sendMessageToClient(connectionId, payload) {
    try { 
        console.log("sending mesage to a connection ", connectionId);
 
        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload),
        }).promise()
        console.log("sending mesage with payload ", payload);

    } catch(e) {
        console.log("failed to send message", JSON.stringify(e))
        if(e.statusCode === 410 ){   // empty 
            console.log("Stale connection");

            await docClient.delete({
                TableName:connectionTable,
                Key: {
                    id: connectionId
                }
            }).promise();

        }
    }
}