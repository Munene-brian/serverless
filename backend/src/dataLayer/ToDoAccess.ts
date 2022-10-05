import * as AWS from "aws-sdk";
import { Types } from 'aws-sdk/clients/s3';
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoUpdate } from "../models/TodoUpdate";
import { TodoItem } from "../models/TodoItem";

export class AccessList {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly TodoListTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX,
        private readonly bucketname = process.env.S3_BUCKET_NAME) {
    }

    async getAllToDo(userId:string): Promise<TodoItem[]>{
        const result = await this.docClient.query({
            TableName: this.TodoListTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

     
    async createToDO(todoItem:TodoItem): Promise<TodoItem>{
        const result = await this.docClient.put({
            TableName: this.TodoListTable,
            Item: todoItem,
        }

        ).promise()
        console.log(result)
        return todoItem as TodoItem
    }
  
    async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
   
        const params = {
            TableName: this.TodoListTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #namefield = :n, #dueDate = :d, #done = :done",
            ExpressionAttributeNames: {
                "#n": "namefield",
                "#d": "dueDate",
                "#done": "done"
            },
            ExpressionAttributeValues: {
                ":n": todoUpdate.name,
                ":d": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ReturnValues: "ALL_DATA"
        };

        let result = await this.docClient.update(params).promise();
        console.log(result);
        const att = result.Attributes;

        return att as TodoUpdate;
    }  
    async deletebyId(todoId: string, userId: string): Promise<string> {
        console.log("Deleting to do Item");
        const params = {
            TableName: this.TodoListTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };
        const result = await this.docClient.delete(params).promise();
        console.log(result);
        return " " as string;
    }

    async imageurlupload(todoId: any): Promise<string> {
        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.bucketname,
            Key: todoId,
            Expires: 2500,
        });
        console.log(url);
        return url;
    }
}


