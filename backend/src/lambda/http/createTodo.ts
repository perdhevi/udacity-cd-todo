import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'


import { getUserId } from '../utils';
import * as todos from '../../businessLayer/todo'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  console.log(event);

  const newTodo: CreateTodoRequest = JSON.parse(event.body)


  const item = await todos.createTodo(newTodo, getUserId(event));
  console.log(item)
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
