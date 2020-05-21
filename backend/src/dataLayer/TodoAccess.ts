import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import * as AWS from 'aws-sdk';

export class TodoAccess {
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly todoIndex = process.env.INDEX_NAME) {        
    }

    async getTodos(userId ): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.todoIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
            }).promise()        
        const items = result.Items;
        return items as TodoItem[];        
    }
    async createTodo(item:TodoItem) : Promise<TodoItem>{
        await this.docClient.put({
            TableName: this.todoTable,
            Item: item
          }).promise().then(res => res).catch(err => console.log(err));
        
          return item;
    }

    async getTodo(userId, todoId) : Promise<TodoItem>{
        console.log('------ DL:getTodo Start---------');
        const queryRest = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: 'todoId = :paritionKey AND userId = :hashKey' ,
            ExpressionAttributeValues: {
              ':paritionKey': todoId,
              ':hashKey': userId
            }
          })
          .promise();
              
          console.log(queryRest);  
          
          const items = queryRest.Items[0];
          console.log(items);
          console.log('------ DL:getTodo end---------');
          return items as TodoItem;        
    }

    async updateTodo(todoId, userId, updatedTodo: TodoUpdate) : Promise<any> {
        console.log('------ DL:updateTodo Start---------');

        const updateResult = await this.docClient.update({
            TableName: this.todoTable,
            Key: { 'todoId': todoId,
              'userId' : userId
            },
            ExpressionAttributeValues: {
              ':name' : updatedTodo.name,
              ':dueDate' : updatedTodo.dueDate,
              ':done': updatedTodo.done        
            },
            ExpressionAttributeNames:{
              "#nm": "name"
            },
            UpdateExpression: 'SET #nm = :name, dueDate = :dueDate, done = :done', 
        
            ReturnValues:"UPDATED_NEW"
          }).promise().then(res => {console.log(res);
            return res.Attributes as TodoUpdate;
          }
          ).catch(err =>  console.log(err));

          console.log(updateResult)
          console.log('------ DL:updateTodo End---------');
        return updateResult
    }

    async updateTodoAttachment(todoId, userId, attachmentUrl): Promise<any>{
        await this.docClient.update({
            TableName: this.todoTable,
            Key: { 'todoId': todoId,
              'userId' : userId
            },
            ExpressionAttributeValues: {
              ':attachmentUrl' : attachmentUrl
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl', 
        
            ReturnValues:"UPDATED_NEW"
          }).promise()          

    }

    async deleteTodo(userId, todoId) : Promise<any>{
        await this.docClient.delete({
            TableName: this.todoTable,
            Key: { 
              'todoId': todoId,
              'userId' : userId
            }
          }).promise().then(res => {return res}).catch(err => console.log(err));
        
        }

}