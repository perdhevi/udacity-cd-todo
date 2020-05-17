import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS from 'aws-sdk';
import { getUserId } from '../utils';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const _todoId = event.pathParameters.todoId
  console.log(event);
  const updatedBody: UpdateTodoRequest = JSON.parse(event.body);

  const updatedTodo ={
    todoId: _todoId,
    
    ...updatedBody
  };
  console.log(updatedTodo);
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const docClient = new AWS.DynamoDB.DocumentClient();
  const todoTable = process.env.TODO_TABLE;

  const queryRest = await docClient.query({
    TableName: todoTable,
    KeyConditionExpression: 'todoId = :paritionKey AND userId = :hashKey' ,
    ExpressionAttributeValues: {
      ':paritionKey': _todoId,
      ':hashKey': getUserId(event)
    }
  })
  .promise();
      
  console.log(queryRest);
  await docClient.update({
    TableName: todoTable,
    Key: { 'todoId': _todoId,
      'userId' : queryRest.Items[0].userId
    },
    ExpressionAttributeValues: {
      ':name' : updatedTodo.name,
      ':dueDate' : updatedTodo.dueDate,
      ':done': updatedTodo.done        
    },
    ExpressionAttributeNames:{
      "#nm": "name"
    },
    UpdateExpression: 'SET #nm = :name, dueDate = :dueDate, done = :done', 

    ReturnValues:"UPDATED_NEW"
  }).promise().then(res => console.log(res)).catch(err =>  console.log(err));
      
  
  
/*
 await docClient.put({
  TableName: todoTable,
  Item: updatedTodo
}).promise().then(res => res).catch(err => err);
*/
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      updatedTodo
    })    
  }
}
