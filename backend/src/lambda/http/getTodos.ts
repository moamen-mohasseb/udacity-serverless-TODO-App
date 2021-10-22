import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser} from '../../businessLogic/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    
    const userId=getUserId(event)
    const todos  = await getTodosForUser(userId)
    if (todos.count !== 0)
    return {
      statusCode: 200,
      body: JSON.stringify({ items: todos }),
    }

  return {
    statusCode: 404,
    body: JSON.stringify({
      error: "Item not found",
    })
  }
})
handler.use(
  cors({
    credentials: true
  })
)
