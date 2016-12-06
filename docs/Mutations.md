# Mutations

## Basic Example

Create a container that has one fragment that creates a To Do when invoked.

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoAdder extends Component {
  render () {
    return (
      <a onClick={this.handleAddToDo.bind(this)}>Add To Do</a>
    );
  }

  handleAddToDo () {
    this.props.ping.addTodo();
  }
}

export default createContainer({
  addTodo: {
    url: () => `/api/todos`,
    method: () => 'POST',
    body: () => ({ title: 'feed dog' }),
  },
}, ToDoAdder);
// POST /api/todos body:'{"title":"feed dog"}'
```

### Or...

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoAdder extends Component {
  render () {
    return (
      <a onClick={this.handleAddToDo.bind(this)}>Add To Do</a>
    );
  }

  handleAddToDo () {
    this.props.ping.addTodo({ body: { title: 'feed dog' } });
  }
}

export default createContainer({
  addTodo: {
    url: () => `/api/todos`,
    method: () => 'POST',
    body: ({ body }) => body,
  },
}, ToDoAdder);
// POST /api/todos body:'{"title":"feed dog"}'
```

## Update an existing item

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoItem extends Component {
  render () {
    return (
      <h1>{this.props.todo.title}</h1>
      <a onClick={this.handleUpdateToDo.bind(this)}>Toggle Status</a>
    );
  }

  handleUpdateToDo () {
    this.props.ping.updateTodo({ body: { done: !this.props.todo.done } });
  }
}

export default createContainer({
  todo: {
    url: ({ props }) => `/api/todos/${props.id}`,
  },
  updateTodo: {
    url: ({ props }) => `/api/todos/${props.id}`,
    method: () => 'PUT',
  },
}, ToDoItem);
// POST /api/todos/123 body:'{"done":true}'
```

### Or...

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoItem extends Component {
  render () {
    return (
      <h1>{this.props.todo.title}</h1>
      <a onClick={this.handleUpdateToDo.bind(this)}>Toggle Status</a>
    );
  }

  handleUpdateToDo () {
    this.props.ping.updateTodo({
      body: { done: !this.props.todo.done },
      id: this.props.id,
    });
  }
}

export default createContainer({
  todo: {
    url: ({ props }) => `/api/todos/${props.id}`,
  },
  updateTodo: {
    url: ({ props, id }) => `/api/todos/${id}`,
    method: () => 'PUT',
  },
}, ToDoItem);
// POST /api/todos/123 body:'{"done":true}'
```

## Everything returns a Promise

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoItem extends Component {
  render () {
    return (
      <h1>{this.props.todo.title}</h1>
      <a onClick={this.handleUpdateToDo.bind(this)}>Toggle Status</a>
    );
  }

  handleUpdateToDo () {
    this.props.ping
      .updateTodo({ body: { done: !this.props.todo.done } })
      .then(() => {
        this.props.ping.todo();
      })
      .catch(error => {
        console.error(error);
      });
  }
}

export default createContainer({
  todo: {
    url: ({ props }) => `/api/todos/${props.id}`,
  },
  updateTodo: {
    url: ({ props }) => `/api/todos/${props.id}`,
    method: () => 'PUT',
  },
}, ToDoItem);
// POST /api/todos/123 body:'{"done":true}'
```
