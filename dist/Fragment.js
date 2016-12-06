(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'superagent'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('superagent'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.superagent);
    global.Fragment = mod.exports;
  }
})(this, function (exports, _superagent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.FRAGMENT_DEFAULTS = undefined;

  var _superagent2 = _interopRequireDefault(_superagent);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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
    }
  };

  var WHITELIST_EVENT_TYPES = ['fetch'];

  exports.default = function (key, config) {

    var fragment = Object.assign({}, FRAGMENT_DEFAULTS, config, { key: key });

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

    fragment.fetch = function (payload) {
      var _this = this;

      this.ping(payload).then(function (response) {
        _this.emit('dispatch', { type: key + '::FETCH_SUCCESS', payload: response });
      });
      // .catch(error => {
      //   // console.log({ error });
      // });;
    };

    fragment.ping = function (params) {
      return this.getOptions(params).client(this.method(params), this.url(params)).set(this.headers(params)).query(this.query(params));
    };

    fragment.getMutator = function (payload) {
      var _this2 = this;

      return function (customParams) {
        return _this2.fetch.call(_this2, Object.assign({}, payload, customParams));
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
      return Object.assign({ client: _superagent2.default }, this.options(params));
    };

    return fragment;
  };
});