import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS from 'aws-sdk';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const docClient = new AWS.DynamoDB.DocumentClient();
  const todoTable = process.env.TODO_TABLE;

  return await docClient.update({
    TableName: todoTable,
    Key: { 'todoId': todoId},
    ExpressionAttributeValues: {
      ':name' : updatedTodo.name,
      ':dueDate' : updatedTodo.dueDate,
      ':done': updatedTodo.done        
    },
    UpdateExpression: 'SET name = :name, dueDate = : dueDate, done = :done', 
    ReturnValues:"UPDATED_NEW"
  }).promise().then(res => res).catch(err => err);
}
