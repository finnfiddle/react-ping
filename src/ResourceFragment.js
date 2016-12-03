import request from 'superagent';

import { FRAGMENT_DEFAULTS } from './Fragment';

const RESOURCE_FRAGMENT_DEFAULTS = {
  baseUrl: () => '',
  list: Object.assign({}, FRAGMENT_DEFAULTS),
  create: Object.assign({}, FRAGMENT_DEFAULTS),
  read: Object.assign({}, FRAGMENT_DEFAULTS),
  update: Object.assign({}, FRAGMENT_DEFAULTS),
  del: Object.assign({}, FRAGMENT_DEFAULTS),
  all: {
    headers: () => ({}),
    query: () => ({}),
  },
  options: {
    defaultVerb: 'list',
  },
};

const WHITELIST_EVENT_TYPES = ['fetch', 'list', 'create', 'read', 'update', 'del'];

export default (key, config) => {

  const fragment = { key };

  fragment.config = Object.assign({}, RESOURCE_FRAGMENT_DEFAULTS, config);

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
    const VERB = this.config.options.defaultVerb.toUpperCase();
    this.ping(this.getDefaultVerb(), payload)
      .then(response => {
        this.emit('dispatch', { type: `${key}::${VERB}_SUCCESS`, payload: response });
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
    const allHeaders = this.all.headers(params);
    const allQuery = this.all.query(params);
    return this.getOptions(verb, params)
      .client(verb.method(params), verb.url(params))
      .set(Object.assign({}, allHeaders, verb.headers(params)))
      .query(Object.assign({}, allQuery, verb.query(params)));
  };

  fragment.getReducer = function () {
    const options = this.getOptions();
    return options.reducer || (
      (state = null, action) => {
        if (!action.type.indexOf(`${key}::`) > -1) return state;
        if (action.type === `${key}::LIST_SUCCESS`) {

        }
      }
    );
  };

  fragment.getOptions = function (verb, params) {
    return Object.assign({ client: request }, verb.options(params));
  };

  fragment.getDefaultVerb = function () {
    return this[this.config.options.defaultVerb];
  };

  return fragment;
};
