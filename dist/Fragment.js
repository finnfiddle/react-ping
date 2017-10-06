'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FRAGMENT_DEFAULTS = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _itsSet = require('its-set');

var _itsSet2 = _interopRequireDefault(_itsSet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FRAGMENT_DEFAULTS = exports.FRAGMENT_DEFAULTS = {
  url: function url() {
    return '';
  },
  headers: function headers() {
    return {};
  },
  query: function query() {
    return {};
  },
  method: function method() {
    return 'GET';
  },
  options: function options() {
    return {};
  },
  onError: function onError(_ref) {
    var error = _ref.error;

    throw error;
  }
};

var DEFAULT_OPTIONS = {
  client: _superagent2.default,
  passive: false
};

var WHITELIST_EVENT_TYPES = ['fetch'];

exports.default = function (key, config, container) {

  var fragment = (0, _assign2.default)({}, FRAGMENT_DEFAULTS, config, { key: key, container: container });

  fragment.listeners = [];

  fragment.addListener = function (listener) {
    this.listeners.push(listener);
  };

  fragment.on = function (type, payload) {
    if (!WHITELIST_EVENT_TYPES.includes(type)) {
      throw new Error('Event type `' + type + '` not known.');
    }
    this[type](payload);
  };

  fragment.emit = function (type, payload) {
    this.listeners.forEach(function (listener) {
      listener.on(type, payload);
    });
  };

  fragment.fetch = function (customParams) {
    var params = fragment.container.getPayload(customParams);
    if (!this.getOptions(params).passive) {
      this.mutate(customParams);
    }
  };

  fragment.mutate = function (customParams) {
    var _this = this;

    return this.ping(fragment.container.getPayload(customParams)).then(function (response) {
      _this.emit('dispatch', { type: key + '::FETCH_SUCCESS', payload: response });
      return response;
    }).catch(function (error) {
      _this.config.onError((0, _assign2.default)({}, customParams, { error: error.response }));
      throw error;
    });
  };

  fragment.ping = function (params) {
    var url = this.url(params);
    if (!(0, _itsSet2.default)(url) || url === false) return new _promise2.default(function (resolve) {
      return resolve();
    });
    var method = this.method(params);
    var request = this.getOptions(params).client(method, url).set(this.headers(params)).query(this.query(params));
    if (['PUT', 'POST'].indexOf(method) > -1) {
      request.send(this.send(params));
    }
    return request;
  };

  fragment.getMutator = function () {
    var _this2 = this;

    return function (customParams) {
      return _this2.mutate.call(_this2, customParams);
    };
  };

  fragment.getReducer = function () {
    var options = this.getOptions();
    return options.reducer || function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var action = arguments[1];
      return action.type.indexOf(key + '::') > -1 ? action.payload : state;
    };
  };

  fragment.getOptions = function (params) {
    return (0, _assign2.default)({}, DEFAULT_OPTIONS, this.options(params));
  };

  return fragment;
};