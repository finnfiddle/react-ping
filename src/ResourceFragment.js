import request from 'superagent';
import itsSet from 'its-set';
import merge from 'lodash/merge';

import { FRAGMENT_DEFAULTS } from './Fragment';

const RESOURCE_FRAGMENT_DEFAULTS = {
  baseUrl: () => '',
  list: Object.assign({}, FRAGMENT_DEFAULTS),
  create: Object.assign({}, FRAGMENT_DEFAULTS, { method: () => 'POST', send: () => ({}) }),
  read: Object.assign({}, FRAGMENT_DEFAULTS),
  update: Object.assign({}, FRAGMENT_DEFAULTS, { method: () => 'PUT', send: () => ({}) }),
  del: Object.assign({}, FRAGMENT_DEFAULTS, { method: () => 'DELETE' }),
  all: {
    headers: () => ({}),
    query: () => ({}),
    onError({ error }) {
      throw error;
    },
  },
  options: {
    defaultVerb: 'list',
    uidKey: 'id',
    passive: false,
    parseResponse: resp => resp,
  },
};

const WHITELIST_EVENT_TYPES = ['fetch', 'list', 'create', 'read', 'update', 'del'];

export default (key, config, container) => {

  const fragment = { key, container };

  fragment.config = merge({}, RESOURCE_FRAGMENT_DEFAULTS, config);

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

  fragment.fetch = function (customParams) {
    const { defaultVerb, passive } = this.config.options;
    if (passive) return;
    const DEFAULT_VERB = defaultVerb.toUpperCase();
    const verb = this.getDefaultVerb();
    return this.ping(verb, fragment.container.getPayload(customParams))
      .then(response => {
        this.emit('dispatch', { type: `${key}::${DEFAULT_VERB}_SUCCESS`, payload: response.body });
        return response;
      })
      .catch(error => {
        verb.onError(Object.assign({}, customParams, { error: error.response }));
      });
  };

  fragment.list = function (customParams) {
    return this.ping(this.config.list, fragment.container.getPayload(customParams))
      .then(response => {
        this.emit('dispatch', { type: `${key}::LIST_SUCCESS`, payload: response.body });
        return response;
      })
      .catch(error => {
        this.config.list.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
  };

  fragment.create = function (customParams) {
    return this.ping(this.config.create, fragment.container.getPayload(customParams))
      .then(response => {
        this.emit('dispatch', { type: `${key}::CREATE_SUCCESS`, payload: response.body });
        return response;
      })
      .catch(error => {
        this.config.create.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
  };

  fragment.read = function (customParams) {
    return this.ping(this.config.read, fragment.container.getPayload(customParams))
      .then(response => {
        this.emit('dispatch', { type: `${key}::READ_SUCCESS`, payload: response.body });
        return response;
      })
      .catch(error => {
        this.config.read.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
  };

  fragment.update = function (customParams) {
    return this.ping(this.config.update, fragment.container.getPayload(customParams))
      .then(response => {
        this.emit('dispatch', { type: `${key}::UPDATE_SUCCESS`, payload: response.body });
        return response;
      })
      .catch(error => {
        this.config.update.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
  };

  fragment.del = function (customParams) {
    return this.ping(this.config.del, fragment.container.getPayload(customParams))
      .then(response => {
        this.emit('dispatch', { type: `${key}::DEL_SUCCESS`, payload: response.body });
        return response;
      })
      .catch(error => {
        this.config.del.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
  };

  fragment.ping = function (verb, params) {
    const allHeaders = this.config.all.headers(params);
    const allQuery = this.config.all.query(params);
    const baseUrl = this.config.baseUrl(params);
    const url = verb.url(params);

    if (
      !itsSet(url) ||
      !itsSet(baseUrl) ||
      url === false ||
      baseUrl === false
    ) {
      return new Promise(resolve => resolve());
    }
    const method = verb.method(params);
    const request = this.getOptions(verb, params)
      .client(method, `${baseUrl}${verb.url(params)}`)
      .set(Object.assign({}, allHeaders, verb.headers(params)))
      .query(Object.assign({}, allQuery, verb.query(params)));
    if (['PUT', 'POST'].indexOf(method) > -1) {
      request.send(verb.send(params));
    }
    return request;
  };

  fragment.getMutator = function () {
    return {
      list: customParams => this.list.call(this, customParams),
      create: customParams => this.create.call(this, customParams),
      read: customParams => this.read.call(this, customParams),
      update: customParams => this.update.call(this, customParams),
      del: customParams => this.del.call(this, customParams),
    };
  };

  fragment.getReducer = function (key) {
    const options = this.getOptions();

    return (state = { data: [], meta: {} }, action) => {
      const payload = options.parseResponse(action.payload);
      if (action.type.indexOf(`${key}::`) === -1) return state;
      if (action.type === `${key}::LIST_SUCCESS`) {
        return payload;
      }
      if (action.type === `${key}::CREATE_SUCCESS`) {
        return Object.assign({}, state, {
          data: state.data.concat(payload.data),
          meta: Object.assign({}, state.meta, payload.meta),
        });
      }
      if (
        action.type === `${key}::UPDATE_SUCCESS` ||
        action.type === `${key}::READ_SUCCESS`
      ) {
        const needle = state.data.filter(i =>
          i[this.config.options.uidKey] === payload.data[this.config.options.uidKey]
        )[0];
        if (itsSet(needle)) {
          Object.assign(needle, payload.data);
        }
        else {
          return Object.assign({}, state, {
            data: state.data.concat(payload.data),
            meta: Object.assign({}, state.meta, payload.meta),
          });
        }
        return Object.assign({}, state, { meta: Object.assign({}, state.meta, payload.meta) });
      }
      if (action.type === `${key}::DEL_SUCCESS`) {
        return Object.assign({}, state, {
          data: state.data.filter(i =>
            i[this.config.options.uidKey] !== payload.data[this.config.options.uidKey]
          ),
          meta: Object.assign({}, state.meta, payload.meta),
        });
      }
    };
  };

  fragment.getOptions = function (verb, params) {
    return Object.assign(
      { client: request },
      this.config.options,
      (itsSet(verb, 'options') ? verb.options(params) : {})
    );
  };

  fragment.getDefaultVerb = function () {
    return this.config[this.config.options.defaultVerb];
  };

  return fragment;
};
