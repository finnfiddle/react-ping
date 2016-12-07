import request from 'superagent';
import itsSet from 'its-set';

export const FRAGMENT_DEFAULTS = {
  url: () => '',
  headers: () => ({}),
  query: () => ({}),
  method: () => 'GET',
  options: () => ({}),
};

const DEFAULT_OPTIONS = {
  client: request,
  passive: false,
};

const WHITELIST_EVENT_TYPES = ['fetch'];

export default (key, config) => {

  const fragment = Object.assign(
    {},
    FRAGMENT_DEFAULTS,
    config,
    { key }
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

  fragment.fetch = function (params) {
    if (!this.getOptions(params).passive) {
      this.mutate(params);
    }
  };

  fragment.mutate = function (params) {
    return this.ping(params)
      .then(response => {
        this.emit('dispatch', { type: `${key}::FETCH_SUCCESS`, payload: response });
      });
      // .catch(error => {
      //   // console.log({ error });
      // });;
  };

  fragment.ping = function (params) {
    const url = this.url(params);
    if (!itsSet(url) || url === false) return new Promise(resolve => resolve());
    return this.getOptions(params)
      .client(this.method(params), url)
      .set(this.headers(params))
      .query(this.query(params));
  };

  fragment.getMutator = function (payload) {
    return customParams => this.mutate.call(this, Object.assign({}, payload, customParams));
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
