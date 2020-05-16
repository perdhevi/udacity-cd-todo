import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS from 'aws-sdk';
import { getUserId } from '../utils';

const docClient = new AWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODO_TABLE;
const todoIndex = process.env.INDEX_NAME;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing Event: ', event)
  // TODO: Authorization for this user
  const userId = getUserId(event);
  console.log(userId);
  // DONE: Get all TODO items for a current user
  

  const result = await docClient.query({
    TableName: todoTable,
    IndexName: todoIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }).promise()

  const items = result.Items;
  console.log('Fetch complete with ', items);
  return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({items})
    }
}
