import request from 'superagent';

export const FRAGMENT_DEFAULTS = {
  url: () => '',
  headers: () => ({}),
  query: () => ({}),
  method: () => 'GET',
  options: () => ({}),
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

  fragment.fetch = function (payload) {
    this.ping(payload)
      .then(response => {
        this.emit('dispatch', { type: `${key}::FETCH_SUCCESS`, payload: response });
      });
      // .catch(error => {
      //   // console.log({ error });
      // });;
  };

  fragment.ping = function (params) {
    return this.getOptions(params)
      .client(this.method(params), this.url(params))
      .set(this.headers(params))
      .query(this.query(params));
  };

  fragment.getMutator = function (payload) {
    return customParams => this.fetch.call(this, Object.assign({}, payload, customParams));
  };

  fragment.getReducer = function () {
    const options = this.getOptions();
    return options.reducer || (
      (state = null, action) => action.type.indexOf(`${key}::`) > -1 ? action.payload : state
    );
  };

  fragment.getOptions = function (params) {
    return Object.assign({ client: request }, this.options(params));
  };

  return fragment;
};
