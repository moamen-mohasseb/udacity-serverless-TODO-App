import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {TodoItem} from "../models/TodoItem"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new AWS.DynamoDB.DocumentClient()
const Tabel_Name = process.env.TODOS_TABLE
const urlExpire = process.env.SIGNED_URL_EXPIRATION
const s3_bucket = process.env.ATTACHMENT_S3_BUCKET
const CREATED_AT_INDEX = process.env.TODOS_CREATED_AT_INDEX
const s3 = new XAWS.S3({
    signatureVersion: "v4",
  })
 {}
export async function createTodo(
    newItem:TodoItem ):Promise<TodoItem> {
        await docClient.put({
            TableName: Tabel_Name,
            Item: newItem
        }).promise()
        return newItem
   }
   export async function deleteTodo(
    todoId: String,
    userId: String
  ): Promise<void> {
    await this.docClient.delete(
        {
          TableName: Tabel_Name,
          Key: {
            todoId,
            userId
          }
  }).catch((err=> {console.log("error: ",err)}))
  console.log("Item Deleted")
}
export async function createAttachmentPresignedUrl(
    todoId: String,
    imageId: String,
    userId: String
  ): Promise<string> {
    const attachmentUrl = await s3.getSignedUrl("putObject", {
        Bucket:s3_bucket,
        Key: imageId,
        Expires: urlExpire,
      });
  
      this.docClient.update(
        {
          TableName: this.todoTable,
          Key: {
            todoId,
            userId,
          },
          UpdateExpression: "set attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
            ":attachmentUrl": `https://${s3_bucket}.s3.amazonaws.com/${imageId}`,
          },
        }).catch(error =>{console.log("error: ",error)})
        console.log("attUrl: ",attachmentUrl)
      return attachmentUrl;
  }
  export async function getTodosForUser(userId):Promise<any>{
    const allItems = docClient
    .query({
      TableName: Tabel_Name,
      IndexName: CREATED_AT_INDEX,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })
    .promise();

  return allItems;
}
export async function updateTodo(  todoId: String,
    updatedTodo: UpdateTodoRequest,
    userId: String
  ): Promise<void>{
    this.docClient.update(
        {
          TableName: Tabel_Name,
          Key: {
            todoId,
            userId
          },
          UpdateExpression: "set #name = :name, #dueDate = :due, #done = :done",
          ExpressionAttributeValues: {
            ":name": updatedTodo.name,
            ":due": updatedTodo.dueDate,
            ":done": updatedTodo.done
          },
          ExpressionAttributeNames: {
            "#name": "name",
            "#dueDate": "dueDate",
            "#done": "done"
          }
        }).catch(error =>{console.log("error: ",error)})
        console.log("update done successfully")

}