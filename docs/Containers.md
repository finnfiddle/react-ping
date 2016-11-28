# Containers

## Basic Example

Create a container that wraps our To Do List component and fetches our todos from the api on mount and passes them as a prop to our component.

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoList extends Component {
  render () {
    return (
      <ul>
        {this.props.todos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    );
  }
}

export default createContainer({
  todos: {
    url: () => '/api/todos',
  },
}, ToDoList);
// GET /api/todos
```

## Dynamic Urls

Make our request url dynamic based on our component's props.

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoItem extends Component {
  render () {
    return (
      <h1>{this.props.todo.title}</h1>
    );
  }
}

export default createContainer({
  todo: {
    url: ({ props }) => `/api/todos/${props.id}`,
  },
}, ToDoItem);
// GET /api/todos/123
```

## Request headers

Same as the previous example but with an added `Authorization` header on the request.

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoItem extends Component {
  render () {
    return (
      <h1>{this.props.todo.title}</h1>
    );
  }
}

export default createContainer({
  todo: {
    url: ({ props }) => `/api/todos/${props.id}`,
    headers: () => ({ Authorization: localStorage.getItem('token') }),
  },
}, ToDoItem);
// GET /api/todos/123 Authorization:token_body
```

## Query Parameters

Add a dynamic query string to our url that is derived from our components props.

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoList extends Component {
  render () {
    return (
      <ul>
        {this.props.todos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    );
  }
}

export default createContainer({
  todos: {
    url: () => '/api/todos',
    query: ({ props }) => ({ status: props.status }),
  },
}, ToDoList);

// GET /api/todos?status=done
```

## Custom Method

Use the POST HTTP method instead of the default GET method.

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoItem extends Component {
  render () {
    return (
      <h1>{this.props.todo.title}</h1>
    );
  }
}

export default createContainer({
  todo: {
    url: ({ props }) => `/api/todos/${props.id}`,
    method: () => 'POST',
  },
}, ToDoItem);
// POST /api/todos/123
```

## Dynamism using state

Make our url dynamic based on our components internal state.

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoItem extends Component {

  state = {
    id: 1,
  }

  render () {
    return (
      <div>
        <h1>{this.props.todo.title}</h1>
        <a onClick={() => { this.setState({ id: this.state.id + 1 }); }}>Next Item</a>
      </div>
    );
  }
}

export default createContainer({
  todo: {
    url: ({ state }) => `/api/todos/${state.id}`,
  },
}, ToDoItem);
// GET /api/todos/1
```
