import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {TodoItem} from "../models/TodoItem"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);
export default class TodoAccess {
    
    //const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
    s3 = new XAWS.S3({signatureVersion: "v4",
      }) 
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly Tabel_Name = process.env.TODOS_TABLE,
      private readonly CREATED_AT_INDEX = process.env.TODOS_CREATED_AT_INDEX,
      private readonly s3_bucket = process.env.ATTACHMENT_S3_BUCKET
     // private  s3 = new AWS.S3({signatureVersion: "v4",
      
    ) { }

 async  accessCreateTodo(
    newItem:TodoItem ):Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.Tabel_Name,
            Item: newItem
        }).promise()
        return newItem
   }
    async  accessDeleteTodo(
    todoId,
    userId
  ): Promise<void> {
    console.log("delete ID",todoId, userId)
    try{
      await this.docClient.delete(
        {
          TableName: this.Tabel_Name,
          Key: {
            todoId,
            userId
          }
  }).promise()
  console.log("Item Deleted")
    }
    catch(error){
      console.log(error)
    }
}

async  accessCreateAttachmentPresignedUrl(
    todoId: String,
    userId: String
  ): Promise<string> {
    try{
      console.log(userId)
    const attachmentUrl = await this.s3.getSignedUrl("putObject", {
        Bucket:this.s3_bucket,
        Key:todoId,
        Expires: 500
      });
  console.log(attachmentUrl)
      return attachmentUrl;
    }
    catch(error){
      console.log(error)
      return `${error}  error attachment url`
    }
  }
  async  accessGetTodosForUser(userId):Promise<any>{
    const allItems =await this.docClient
    .query({
      TableName: this.Tabel_Name,
      IndexName: this.CREATED_AT_INDEX,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })
    .promise();

  return allItems.Items;
}
 async  accessUpdateTodo(  todoId: String,
    updatedTodo: UpdateTodoRequest,
    userId: String
  ): Promise<void>{
    const params = {
      TableName: this.Tabel_Name,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ExpressionAttributeNames: {
        '#todo_name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done,
      },
      UpdateExpression: 'SET #todo_name = :name, dueDate = :dueDate, done = :done',
      ReturnValues: 'ALL_NEW',
    };
    const result = await this.docClient.update(params).promise();
    console.log(`Update statement has completed without error`, result);
   //
  }
}