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
        private readonly s3BucketName = process.env.S3_BUCKET_NAME) {
    }

    async getAllToDo(userId: string): Promise<TodoItem[]> {
        const par = {
            TableName: this.TodoListTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        let result = await this.docClient.query(par).promise();
        console.log(result);
        let items = result.Items;
        return items as TodoItem[];
    }

    async createToDo(todoItem: TodoItem): Promise<TodoItem> {
        console.log("Creating to do list");
        const params = {
            TableName: this.TodoListTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(params).promise();
        console.log(result);

        return todoItem as TodoItem;
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

    async imageurlupload(todoId: string): Promise<string> {
        console.log("Generating image url ...");
        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 2500,
        });
        console.log(url);
        return url;
    }
}


