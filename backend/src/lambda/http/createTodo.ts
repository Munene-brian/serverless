import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, 
    APIGatewayProxyResult} from 'aws-lambda'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest';
import {createToDo} from "../../Logic/ToDo";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
    console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtoken = split[1];

    const resquestBody: CreateTodoRequest = JSON.parse(event.body);
    const item = await createToDo(resquestBody, jwtoken);

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item
        }),
    }
    }
        catch (error){
            error
        }
};
