# react-ping

**Relay without GraphQL** - Declarative HTTP/REST data fetching for React.

## Motivation

GraphQL is pretty great and saves us sending more data along the wire than we need to. However, it isn't everybody's cup of tea and REST is likely going to be around for a long time.

Relay is also really nice because we can declaratively wire up React apps with GraphQL APIs. No more imperative calls to functions to send network requests etc...

So React Ping attempts to be Relay for REST and fill the gap for all those that like what Relay (and GraphQL) are trying to achieve but don't necessarily want to use GraphQL.

## Installation

```
npm install react-ping
```

## Example

An example To Do app that lists and can create To Dos.

```javascript
import React, { Component } from 'react';
import { createContainer } from 'react-ping';

class ToDoList extends Component {
  render () {
    return (
      <div>
        <a onClick={this.handleCreateTodo.bind(this)}>Create To Do</a>
        <ul>
          {this.props.todos.map(todo => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      </div>
    );
  }

  handleCreateTodo () {
    this.props.createTodo({ title: this.props.todos.length });
  }
}

export default createContainer({
  todos: {
    url: ({ props, state }) => '/api/todos',
  },
  createTodo: {
    url: ({ props, state }) => '/api/todos',
    method: ({ props, state }) => 'POST',
    body: ({ props, state, title }) => ({ title }),
  },
}, ToDoList);

// ==> GET - /api/todos
// ==> POST - /api/todos - body: { title: 0 }
```

Or the same as above but using a [Resource](/docs/Resource.md). A Resource passes a collection of data to the wrapped component and provides CRUD methods for sending network requests that when resolved either add, update or remove items from the collection.

```javascript
import React, { Component } from 'react';
import { createContainer, createResource } from 'react-ping';

class ToDoList extends Component {
  render () {
    return (
      <div>
        <a onClick={this.handleCreateTodo.bind(this)}>Create To Do</a>
        <ul>
          {this.props.todos.map(todo => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      </div>
    );
  }

  handleCreateTodo () {
    this.props.ping.todos.create({ title: this.props.todos.length });
  }
}

export default createContainer({
  todos: createResource({
    baseUrl: ({ props, state }) => '/api/todos',
    create: {
      body: ({ props, state, title }) => ({ title }),
    },
  }),
}, ToDoList);

// ==> GET - /api/todos
// ==> POST - /api/todos - body: { title: 0 }
```

## Docs & Help

- [Guides and API docs](/docs)
- [Reporting Issues](https://github.com/finnfiddle/react-ping/issues)
