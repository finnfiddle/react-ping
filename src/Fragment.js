import request from 'superagent';
import itsSet from 'its-set';

export const FRAGMENT_DEFAULTS = {
  url: () => '',
  headers: () => ({}),
  query: () => ({}),
  method: () => 'GET',
  options: () => ({}),
  onError({ error }) {
    throw error;
  },
};

const DEFAULT_OPTIONS = {
  client: request,
  passive: false,
};

const WHITELIST_EVENT_TYPES = ['fetch'];

export default (key, config, container) => {

  const fragment = Object.assign(
    {},
    FRAGMENT_DEFAULTS,
    config,
    { key, container }
  );

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
    const params = fragment.container.getPayload(customParams);
    if (!this.getOptions(params).passive) {
      this.mutate(customParams);
    }
  };

  fragment.mutate = function (customParams) {
    return this.ping(fragment.container.getPayload(customParams))
      .then(response => {
        this.emit('dispatch', { type: `${key}::FETCH_SUCCESS`, payload: response });
        return response;
      })
      .catch(error => {
        this.config.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
  };

  fragment.ping = function (params) {
    const url = this.url(params);
    if (!itsSet(url) || url === false) return new Promise(resolve => resolve());
    const method = this.method(params);
    const request = this.getOptions(params)
      .client(method, url)
      .set(this.headers(params))
      .query(this.query(params));
    if (['PUT', 'POST'].indexOf(method) > -1) {
      request.send(this.send(params));
    }
    return request;
  };

  fragment.getMutator = function () {
    return customParams => this.mutate.call(this, customParams);
  };

  fragment.getReducer = function () {
    const options = this.getOptions();
    return options.reducer || (
      (state = null, action) => action.type.indexOf(`${key}::`) > -1 ? action.payload : state
    );
  };

  fragment.getOptions = function (params) {
    return Object.assign({}, DEFAULT_OPTIONS, this.options(params));
  };

  return fragment;
};
