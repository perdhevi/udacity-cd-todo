import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as todos from '../../businessLayer/todo'

import { getUserId } from '../utils';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const _todoId = event.pathParameters.todoId
  console.log(event);
  const updatedBody: UpdateTodoRequest = JSON.parse(event.body);

  const updateResult = await todos.updateTodo(_todoId, updatedBody, getUserId(event));
  
  console.log(updateResult);
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      updateResult
    })    
  }
}
