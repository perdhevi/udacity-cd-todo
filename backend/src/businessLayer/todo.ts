import { TodoItem } from '../models/TodoItem'
//import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/TodoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'



const todoAccess = new TodoAccess();

export async function getTodo(userId): Promise<TodoItem[]> {
    return todoAccess.getTodos(userId);
}

export async function createTodo(newTodo: CreateTodoRequest,
    userId) {
    const uuid = require('uuid')
    const _todoId = uuid.v4();
    const _now = new Date();
      
    const item ={
        todoId : _todoId,
        createdAt : _now.toISOString(),
        userId : userId,
        ...newTodo,
        done : false
    
    }
    return todoAccess.createTodo(item);
}

export async function updateTodo(_todoId, updatedBody: UpdateTodoRequest, userId ): Promise<any>
{   
    console.log('------BL start--------');
    const updatedTodo ={
        todoId: _todoId,
        
        ...updatedBody
      };
      console.log(updatedTodo);

      const queryRest = await todoAccess.getTodo(userId,_todoId);
      console.log(queryRest);
      
      const updateResult =  await todoAccess.updateTodo( _todoId, userId, updatedTodo)
      console.log('------BL end--------');
      return updateResult;
}

export async function deleteTodo(todoId,userId): Promise<any>{
    console.log('------BL start--------');    
    const result = await todoAccess.deleteTodo(userId, todoId);
    console.log(result);
    console.log('------BL end--------');
    return result;
}

export async function updateURL(todoId, url): Promise <any> {
    console.log('------BL start--------');  
    const result = await todoAccess.updateTodoAttachment(todoId, url);  
    console.log('------BL end--------');
    return result;
}