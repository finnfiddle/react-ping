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
            <li key={todo.id}>
              <a onClick={this.handleToggleActive.bind(this, todo.id, !todo.active)}>
                {todo.title}
              </a>
            </li>
          ))}
        </ul>
        <a onClick={() => { this.setState({ page: this.state.page + 1 }); }}>Next Page</a>
      </div>
    );
  }

  handleAddToDo () {
    this.props.todos.create({ body: { title: 'feed dog' } });
  }

  handleToggleActive(id, active) {
    this.props.todos.update({ id, body: { active } });
  }
}

export default createContainer({
  todos: createResource({
    baseUrl: () => '/api/todos',
    list: {
      query: ({ state }) => ({ page: state.page }),
    },
    create: {
      body: ({ body }) => body,
    },
    update: {
      url: ({ id }) => `/${id}`,
      body: ({ body }) => body,
    },
    all: {
      headers: () => ({
        Authorization: localStorage.getItem('token'),
      }),
    },
  }),
}, ToDoList);
// GET /api/todos
```

## Defaults

```javascript
{
  // root/base url for requests
  baseUrl: ({ props, state, ...customProps }) => '',
  // config for `list` requests
  list: {
    // url getter
    url: ({ props, state, ...customProps }) => '',
    // headers object getter
    headers: ({ props, state, ...customProps }) => ({}),
    // query string vars object getter (is later stringified using query-string module)
    query: ({ props, state, ...customProps }) => ({}),
    // HTTP method getter
    method: ({ props, state, ...customProps }) => 'GET',
  },
  create: {
    url: ({ props, state, ...customProps }) => '',
    headers: ({ props, state, ...customProps }) => ({}),
    query: ({ props, state, ...customProps }) => ({}),
    method: ({ props, state, ...customProps }) => 'POST',
  },
  read: {
    url: ({ props, state, ...customProps }) => '',
    headers: ({ props, state, ...customProps }) => ({}),
    query: ({ props, state, ...customProps }) => ({}),
    method: ({ props, state, ...customProps }) => 'GET',
  },
  update: {
    url: ({ props, state, ...customProps }) => '',
    headers: ({ props, state, ...customProps }) => ({}),
    query: ({ props, state, ...customProps }) => ({}),
    method: ({ props, state, ...customProps }) => 'PUT',
  },
  del: {
    url: ({ props, state, ...customProps }) => '',
    headers: ({ props, state, ...customProps }) => ({}),
    query: ({ props, state, ...customProps }) => ({}),
    method: ({ props, state, ...customProps }) => 'DELETE',
  },
  // config for all verbs above. Individual verb config gets merged in (overrides) this.
  all: {
    headers: ({ props, state, ...customProps }) => ({}),
    query: ({ props, state, ...customProps }) => ({}),
  },
  // general options
  options: {
    // the verb/action/method that gets called when the component mounts
    defaultVerb: 'list',
    // key that is used to uniquely identify items in the collection
    uidKey: 'id',
    // function used for merging a list of items into the collection.
    // By default it just replaces the existing items.
    mergeList(state, list) {
      return list;
    },
    // function used for merging an item into the collection.
    // By default if the item is found in the collection using its `uidKey` then the new item
    // gets Object.assign'ed onto it. Else it is added to the collection.
    mergeItem(state, item) {
      const needle = state.filter(i => i[this.uidKey] === item[this.uidKey])[0];
      if (itsSet(needle)) {
        Object.assign(needle, item);
      }
      else {
        return state.concat(item);
      }
      return state;
    },
    // function for adding a new item to the collection
    addItem(state, item) {
      return state.concat(item);
    },
    // function for finding and removing an item from the collection
    removeItem(state, item) {
      return state.filter(i => i[this.uidKey] !== item[this.uidKey]);
    },
  },
}
```
