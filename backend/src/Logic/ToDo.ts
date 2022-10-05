import {TodoItem} from "../models/TodoItem";
import {parseUserId} from "../auth/utils";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
import {AccessList} from "../dataLayer/ToDoAccess";
const uuid = require('uuid/v4');
import * as uuid from 'uuid';

const toDoAccess = new AccessList();

export async function getAllToDo({ jsntkn }: { jsntkn : any; }): Promise<TodoItem[]> {
    const userId = parseUserId(jsntkn );
    return toDoAccess.getAllToDo(userId); 
}


export function createToDo(todoRequest: CreateTodoRequest, jsntkn : any): Promise<TodoItem> {
    const userId = parseUserId(jsntkn );
    const todolistId =  uuid(); 	//Create a version 4 random (UUID) unique Id
    const bucketName = process.env.S3_BUCKET_NAME;
    
    return toDoAccess.createToDO({
        todoId: todolistId,userId: userId,
        attachmentUrl:  `https://${bucketName}.s3.amazonaws.com/${todolistId}`, 
        createdAt: new Date().toISOString(),
        done: false, ...todoRequest,
    });
}

export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, jsntkn : string): Promise<TodoUpdate> {
    const userId = parseUserId(jsntkn );
    return toDoAccess.updateToDo(updateTodoRequest, todoId, userId);
}
export function deleteToDo({ todolistId, jsntkn  }: { todolistId: string; jsntkn : string; }): Promise<string> {
    const userId = parseUserId(jsntkn );
    return toDoAccess.deletebyId(todolistId, userId);
}

export function imageurlupload({ todolistId }: { todolistId: string }): Promise<string> {
    return toDoAccess.imageurlupload(todolistId);
}
