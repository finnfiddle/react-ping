import request from 'superagent';
import itsSet from 'its-set';
import _ from 'lodash';

import { FRAGMENT_DEFAULTS } from './Fragment';

const RESOURCE_FRAGMENT_DEFAULTS = {
  baseUrl: () => '',
  list: Object.assign({}, FRAGMENT_DEFAULTS),
  create: Object.assign({}, FRAGMENT_DEFAULTS, { method: () => 'POST' }),
  read: Object.assign({}, FRAGMENT_DEFAULTS),
  update: Object.assign({}, FRAGMENT_DEFAULTS, { method: () => 'PUT' }),
  del: Object.assign({}, FRAGMENT_DEFAULTS, { method: () => 'DELETE' }),
  all: {
    headers: () => ({}),
    query: () => ({}),
  },
  options: {
    defaultVerb: 'list',
    mergeList: (state, list) => list,
    mergeItem: (state, item) => Object.assign(state.filter(i => i.id === item.id)[0], {}),
    addItem: (state, item) => state.concat(item),
    removeItem: (state, item) => state.filter(i => i.id !== item.id),
  },
};

const WHITELIST_EVENT_TYPES = ['fetch', 'list', 'create', 'read', 'update', 'del'];

export default (key, config) => {

  const fragment = { key };

  fragment.config = _.merge({}, RESOURCE_FRAGMENT_DEFAULTS, config);

  fragment.listeners = [];

  fragment.addListener = function (listener) {
    this.listeners.push(listener);
  };

  fragment.on = function (type, payload) {
    if (!WHITELIST_EVENT_TYPES.includes(type)) {
      throw new Error(`Event type \`${type}\` not known.`);
    }
    this[type](payload);
  };

  fragment.emit = function (type, payload) {
    this.listeners.forEach(listener => {
      listener.on(type, payload);
    });
  };

  fragment.fetch = function (payload) {
    const DEFAULT_VERB = this.config.options.defaultVerb.toUpperCase();
    this.ping(this.getDefaultVerb(), payload)
      .then(response => {
        this.emit('dispatch', { type: `${key}::${DEFAULT_VERB}_SUCCESS`, payload: response });
      })
      .catch(error => {
        this.emit('request_error', error);
      });
  };

  fragment.list = function (payload) {
    this.ping(this.config.list, payload)
      .then(response => {
        this.emit('dispatch', { type: `${key}::LIST_SUCCESS`, payload: response });
      })
      .catch(error => {
        this.emit('request_error', error);
      });
  };

  fragment.create = function (payload) {
    this.ping(this.config.create, payload)
      .then(response => {
        this.emit('dispatch', { type: `${key}::CREATE_SUCCESS`, payload: response });
      })
      .catch(error => {
        this.emit('request_error', error);
      });
  };

  fragment.read = function (payload) {
    this.ping(this.config.read, payload)
      .then(response => {
        this.emit('dispatch', { type: `${key}::READ_SUCCESS`, payload: response });
      })
      .catch(error => {
        this.emit('request_error', error);
      });
  };

  fragment.update = function (payload) {
    this.ping(this.config.update, payload)
      .then(response => {
        this.emit('dispatch', { type: `${key}::UPDATE_SUCCESS`, payload: response });
      })
      .catch(error => {
        this.emit('request_error', error);
      });
  };

  fragment.del = function (payload) {
    this.ping(this.config.del, payload)
      .then(response => {
        this.emit('dispatch', { type: `${key}::DEL_SUCCESS`, payload: response });
      })
      .catch(error => {
        this.emit('request_error', error);
      });
  };

  fragment.ping = function (verb, params) {
    const allHeaders = this.config.all.headers(params);
    const allQuery = this.config.all.query(params);
    return this.getOptions(verb, params)
      .client(verb.method(params), verb.url(params))
      .set(Object.assign({}, allHeaders, verb.headers(params)))
      .query(Object.assign({}, allQuery, verb.query(params)));
  };

  fragment.getMutator = function (payload) {
    return {
      list: customParams => this.list.call(this, (Object.assign({}, payload, customParams))),
      create: customParams => this.create.call(this, (Object.assign({}, payload, customParams))),
      read: customParams => this.read.call(this, (Object.assign({}, payload, customParams))),
      update: customParams => this.update.call(this, (Object.assign({}, payload, customParams))),
      del: customParams => this.list.call(this, (Object.assign({}, payload, customParams))),
    };
  };

  fragment.getReducer = function (key) {
    const options = this.getOptions();
    return options.reducer || (
      (state = [], action) => {
        console.log(action.type.indexOf(`${key}::`) === -1, action.type === `${key}::LIST_SUCCESS`);
        if (action.type.indexOf(`${key}::`) === -1) return state;
        if (action.type === `${key}::LIST_SUCCESS`) {
          console.log('yup', options.mergeList(state, action.payload));
          return options.mergeList(state, action.payload);
        }
        if (action.type === `${key}::CREATE_SUCCESS`) {
          return options.addItem(state, action.payload);
        }
        if (
          action.type === `${key}::UPDATE_SUCCESS` ||
          action.type === `${key}::READ_SUCCESS`
        ) {
          return options.mergeItem(state, action.payload);
        }
        if (action.type === `${key}::DEL_SUCCESS`) {
          return options.removeItem(state, action.payload);
        }
        return state;
      }
    );
  };

  fragment.getOptions = function (verb, params) {
    return Object.assign(
      { client: request },
      this.config.options,
      (itsSet(verb) ? verb.options(params) : {})
    );
  };

  fragment.getDefaultVerb = function () {
    return this.config[this.config.options.defaultVerb];
  };

  return fragment;
};
