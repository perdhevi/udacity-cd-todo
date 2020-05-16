import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS from 'aws-sdk';
import { getUserId } from '../utils';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//TODO: Add authorization

  const _todoId = event.pathParameters.todoId
  const docClient = new AWS.DynamoDB.DocumentClient();
  const todoTable = process.env.TODO_TABLE;

  // DONE: Remove a TODO item by id

  const queryRest = await docClient.query({
    TableName: todoTable,
    KeyConditionExpression: 'todoId = :paritionKey AND userId = :hashKey',
    ExpressionAttributeValues: {
      ':paritionKey': _todoId,
      ':hashKey': getUserId(event)
    }
  })
  .promise();  
  if(queryRest.Count === 0 ){
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body:"{ message: empty }"
       
    }
  }
  await docClient.delete({
    TableName: todoTable,
    Key: { 
      'todoId': _todoId,
      'createdAt' : queryRest.Items[0].createdAt
    }
  }).promise().then(res => res).catch(err => console.log(err));

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body:""
     
  }
}
