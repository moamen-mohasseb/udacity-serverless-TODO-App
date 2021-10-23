import {TodoItem} from "../models/TodoItem"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import TodoAccess from "./todoAccess";
//import {accessCreateAttachmentPresignedUrl,accessCreateTodo,accessDeleteTodo,accessGetTodosForUser,accessUpdateTodo} from "./todoAccess"
const acessobj= new TodoAccess
export async function createTodo(
    newItem:TodoItem ):Promise<TodoItem> {
        await acessobj.accessCreateTodo(newItem)
        return newItem
   }
   export async function deleteTodo(
    todoId,
    userId
  ): Promise<void> {
    console.log("delete ID",todoId, userId)
    acessobj.accessDeleteTodo(todoId,userId)
}
export async function createAttachmentPresignedUrl(
    todoId: String,
    userId: String
  ): Promise<string> {
   
      return acessobj.accessCreateAttachmentPresignedUrl(todoId,userId); 
  }
  export async function getTodosForUser(userId):Promise<any>{
   
  return acessobj.accessGetTodosForUser(userId);
}
export async function updateTodo(  todoId: String,
    updatedTodo: UpdateTodoRequest,
    userId: String
  ): Promise<any>{
return await acessobj.accessUpdateTodo(todoId,updatedTodo,userId)
}