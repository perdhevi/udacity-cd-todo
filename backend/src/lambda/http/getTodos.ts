import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as todos from '../../businessLayer/todo'
import { getUserId } from '../utils';



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing Event: ', event)
  // TODO: Authorization for this user
  const userId = getUserId(event);
  console.log(userId);
  // DONE: Get all TODO items for a current user
  const items = await todos.getTodo(userId);

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
