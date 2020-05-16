import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as AWS from 'aws-sdk';
import { getUserId } from '../utils';



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const docClient = new AWS.DynamoDB.DocumentClient();
  const todoTable = process.env.TODO_TABLE;
  const uuid = require('uuid')
  console.log(event);

  const _todoId = uuid.v4();
  const _now = new Date();
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const item ={
    todoId : _todoId,
    createdAt : _now.toISOString(),
    userId : getUserId(event),
    ...newTodo,
    done : false

  }
    console.log(item)
  await docClient.put({
    TableName: todoTable,
    Item: item
  }).promise().then(res => res).catch(err => console.log(err));
  // DONE: Implement creating a new TODO item
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      item
    }) 
  }
}
