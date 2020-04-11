import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as AWS from 'aws-sdk';



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const docClient = new AWS.DynamoDB.DocumentClient();
  const todoTable = process.env.TODO_TABLE;
  
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  //const authorizaton = event.headers.Authorization
  //const split = authorizaton.split(' ')
  //const jwtToken = split[1]
  //TODO: add authorization
    

  // DONE: Implement creating a new TODO item
  return await docClient.put({
    TableName: todoTable,
    Item: newTodo
  }).promise().then(res => res).catch(err => err);
}
