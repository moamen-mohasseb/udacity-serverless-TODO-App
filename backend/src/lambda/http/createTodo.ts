import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { v4 } from 'uuid';
import { TodoItem } from '../../models/TodoItem'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const todoId = v4()
    const userid=getUserId(event)
   
    const newItem = {
      todoId: todoId,
        userId: userid,
    
        ...newTodo
    }
    console.log("newItem: ",newItem)
    const newTodoList = await createTodo(newItem as TodoItem)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodoList,
      }),
    };
  }
);
  
handler.use(
  cors({
    credentials: true
  })
)
