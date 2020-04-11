import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS from 'aws-sdk';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//TODO: Add authorization

  const todoId = event.pathParameters.todoId
  const docClient = new AWS.DynamoDB.DocumentClient();
  const todoTable = process.env.TODO_TABLE;

  // DONE: Remove a TODO item by id
  return await docClient.delete({
    TableName: todoTable,
    Key: { 'todoId': todoId}
  }).promise().then(res => res).catch(err => err);
}
