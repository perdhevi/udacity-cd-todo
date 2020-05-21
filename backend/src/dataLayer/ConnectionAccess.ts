import { ConnectionSession } from '../models/ConnectionSession'
import * as AWS from 'aws-sdk';

export class ConnectionAccess {
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly connectionTable = process.env.CONNECTIONS_TABLE//,
        //private readonly connectionIndex = process.env.CONNECTIONS_INDEX
        ) {        
    }

    async createTodo(item:ConnectionSession) : Promise<ConnectionSession>{
        await this.docClient.put({
            TableName: this.connectionTable,
            Item: item
          }).promise().then(res => res).catch(err => console.log(err));
        
          return item;
    }    
    async deleteTodo(connectionId) : Promise<any>{
        await this.docClient.delete({
            TableName:this.connectionTable,
            Key: {
                id: connectionId
            }
        }).promise().then(res => { return res});        
        return "";
    }    

    async getAllConnection() : Promise<ConnectionSession[]> {
        const result = await this.docClient.scan({
            TableName: this.connectionTable
        }).promise()

        const items = result.Items;
        return items as ConnectionSession[];        

    }
}