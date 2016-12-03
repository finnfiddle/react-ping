# Resources

## Basic Example

```javascript
import React, { Component } from 'react';
import { createContainer, createResource } from 'react-ping';

class ToDoList extends Component {

  state = {
    page: 0,
  }

  render () {
    return (
      <div>
        <a onClick={this.handleAddToDo.bind(this)}>Add To Do</a>
        <ul>
          {this.props.todos.map(todo => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
        <a onClick={() => { this.setState({ page: this.state.page + 1 }); }}>Next Page</a>
      </div>
    );
  }

  handleAddToDo () {
    this.props.todos.create({ body: { title: 'feed dog' } });
  }
}

export default createContainer({
  todos: createResource({
    baseUrl: () => '/api/todos',
    list: {
      query: ({ state }) => ({ page: state.page }),
    },
    create: {},
    read: {
      url: ({ customParams }) => `/${customParams.id}`,
    },
    update: {
      url: ({ customParams }) => `/${customParams.id}`,
    },
    del: {
      url: ({ customParams }) => `/${customParams.id}`,
    },
    all: {
      headers: () => ({
        Authorization: localStorage.getItem('token'),
      }),
    },
    options: {
      defaultVerb: 'list',
    }
  }),
}, ToDoList);
// GET /api/todos
```
