import React, { Component } from 'react';
import { createStore } from 'redux';
import get from 'lodash/get';

import Fragments from './Fragments';

export const createContainer = (config, WrappedComponent) => class extends Component {

  state = {}

  componentWillMount() {
    this.listeners = [];
    this.fragments = Fragments(config);
    this.store = createStore(this.fragments.getReducer());
    this.store.subscribe(() => {
      this.setState(this.store.getState());
    });
    this.fragments.listen(this);
  }

  componentDidMount() {
    this.emit('fetch', this.getPayload());
  }

  render() {
    return (
      <WrappedComponent
        {...this.state}
        ref={c => { this.wrapped = c; }}
        ping={this.getMutator()}
      />
    );
  }

  getMutator() {
    return Object.keys(this.fragments.definitions).reduce((acc, key) =>
      Object.assign({}, acc, {
        [key]: this.fragments.definitions[key].getMutator(this.getPayload()),
      })
    , {});
  }

  getPayload(customParams) {
    return Object.assign(
      {},
      { props: this.props, state: get(this, 'wrapped.state') },
      customParams
    );
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  emit(type, payload) {
    this.listeners.forEach(listener => {
      listener.on(type, payload);
    });
  }

  on(type, payload) {
    switch (type) {
      case 'dispatch':
        this.store.dispatch(payload);
        break;
    }
  }

};

export const createResource = resourceConfig =>
  Object.assign({}, resourceConfig, { isResource: true });
