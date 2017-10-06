(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'superagent', 'its-set', 'lodash/merge', './Fragment'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('superagent'), require('its-set'), require('lodash/merge'), require('./Fragment'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.superagent, global.itsSet, global.merge, global.Fragment);
    global.ResourceFragment = mod.exports;
  }
})(this, function (exports, _superagent, _itsSet, _merge, _Fragment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _superagent2 = _interopRequireDefault(_superagent);

  var _itsSet2 = _interopRequireDefault(_itsSet);

  var _merge2 = _interopRequireDefault(_merge);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var RESOURCE_FRAGMENT_DEFAULTS = {
    baseUrl: function baseUrl() {
      return '';
    },
    list: Object.assign({}, _Fragment.FRAGMENT_DEFAULTS),
    create: Object.assign({}, _Fragment.FRAGMENT_DEFAULTS, { method: function method() {
        return 'POST';
      }, send: function send() {
        return {};
      } }),
    read: Object.assign({}, _Fragment.FRAGMENT_DEFAULTS),
    update: Object.assign({}, _Fragment.FRAGMENT_DEFAULTS, { method: function method() {
        return 'PUT';
      }, send: function send() {
        return {};
      } }),
    del: Object.assign({}, _Fragment.FRAGMENT_DEFAULTS, { method: function method() {
        return 'DELETE';
      } }),
    all: {
      headers: function headers() {
        return {};
      },
      query: function query() {
        return {};
      },
      onError: function onError(_ref) {
        var error = _ref.error;

        throw error;
      }
    },
    options: {
      defaultVerb: 'list',
      uidKey: 'id',
      passive: false,
      parseResponse: function parseResponse(resp) {
        return resp;
      }
    }
  };

  var WHITELIST_EVENT_TYPES = ['fetch', 'list', 'create', 'read', 'update', 'del'];

  exports.default = function (key, config, container) {

    var fragment = { key: key, container: container };

    fragment.config = (0, _merge2.default)({}, RESOURCE_FRAGMENT_DEFAULTS, config);

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
      var _this = this;

      var _config$options = this.config.options,
          defaultVerb = _config$options.defaultVerb,
          passive = _config$options.passive;

      if (passive) return;
      var DEFAULT_VERB = defaultVerb.toUpperCase();
      var verb = this.getDefaultVerb();
      return this.ping(verb, fragment.container.getPayload(customParams)).then(function (response) {
        _this.emit('dispatch', { type: key + '::' + DEFAULT_VERB + '_SUCCESS', payload: response.body });
        return response;
      }).catch(function (error) {
        verb.onError(Object.assign({}, customParams, { error: error.response }));
      });
    };

    fragment.list = function (customParams) {
      var _this2 = this;

      return this.ping(this.config.list, fragment.container.getPayload(customParams)).then(function (response) {
        _this2.emit('dispatch', { type: key + '::LIST_SUCCESS', payload: response.body });
        return response;
      }).catch(function (error) {
        _this2.config.list.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
    };

    fragment.create = function (customParams) {
      var _this3 = this;

      return this.ping(this.config.create, fragment.container.getPayload(customParams)).then(function (response) {
        _this3.emit('dispatch', { type: key + '::CREATE_SUCCESS', payload: response.body });
        return response;
      }).catch(function (error) {
        _this3.config.create.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
    };

    fragment.read = function (customParams) {
      var _this4 = this;

      return this.ping(this.config.read, fragment.container.getPayload(customParams)).then(function (response) {
        _this4.emit('dispatch', { type: key + '::READ_SUCCESS', payload: response.body });
        return response;
      }).catch(function (error) {
        _this4.config.read.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
    };

    fragment.update = function (customParams) {
      var _this5 = this;

      return this.ping(this.config.update, fragment.container.getPayload(customParams)).then(function (response) {
        _this5.emit('dispatch', { type: key + '::UPDATE_SUCCESS', payload: response.body });
        return response;
      }).catch(function (error) {
        _this5.config.update.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
    };

    fragment.del = function (customParams) {
      var _this6 = this;

      return this.ping(this.config.del, fragment.container.getPayload(customParams)).then(function (response) {
        _this6.emit('dispatch', { type: key + '::DEL_SUCCESS', payload: response.body });
        return response;
      }).catch(function (error) {
        _this6.config.del.onError(Object.assign({}, customParams, { error: error.response }));
        throw error;
      });
    };

    fragment.ping = function (verb, params) {
      var allHeaders = this.config.all.headers(params);
      var allQuery = this.config.all.query(params);
      var baseUrl = this.config.baseUrl(params);
      var url = verb.url(params);

      if (!(0, _itsSet2.default)(url) || !(0, _itsSet2.default)(baseUrl) || url === false || baseUrl === false) {
        return new Promise(function (resolve) {
          return resolve();
        });
      }
      var method = verb.method(params);
      var request = this.getOptions(verb, params).client(method, '' + baseUrl + verb.url(params)).set(Object.assign({}, allHeaders, verb.headers(params))).query(Object.assign({}, allQuery, verb.query(params)));
      if (['PUT', 'POST'].indexOf(method) > -1) {
        request.send(verb.send(params));
      }
      return request;
    };

    fragment.getMutator = function () {
      var _this7 = this;

      return {
        list: function list(customParams) {
          return _this7.list.call(_this7, customParams);
        },
        create: function create(customParams) {
          return _this7.create.call(_this7, customParams);
        },
        read: function read(customParams) {
          return _this7.read.call(_this7, customParams);
        },
        update: function update(customParams) {
          return _this7.update.call(_this7, customParams);
        },
        del: function del(customParams) {
          return _this7.del.call(_this7, customParams);
        }
      };
    };

    fragment.getReducer = function (key) {
      var _this8 = this;

      var options = this.getOptions();

      return function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { data: [], meta: {} };
        var action = arguments[1];

        var payload = options.parseResponse(action.payload);
        if (action.type.indexOf(key + '::') === -1) return state;
        if (action.type === key + '::LIST_SUCCESS') {
          return payload;
        }
        if (action.type === key + '::CREATE_SUCCESS') {
          return Object.assign({}, state, {
            data: state.data.concat(payload.data),
            meta: Object.assign({}, state.meta, payload.meta)
          });
        }
        if (action.type === key + '::UPDATE_SUCCESS' || action.type === key + '::READ_SUCCESS') {
          var needle = state.data.filter(function (i) {
            return i[_this8.config.options.uidKey] === payload.data[_this8.config.options.uidKey];
          })[0];
          if ((0, _itsSet2.default)(needle)) {
            Object.assign(needle, payload.data);
          } else {
            return Object.assign({}, state, {
              data: state.data.concat(payload.data),
              meta: Object.assign({}, state.meta, payload.meta)
            });
          }
          return Object.assign({}, state, { meta: Object.assign({}, state.meta, payload.meta) });
        }
        if (action.type === key + '::DEL_SUCCESS') {
          return Object.assign({}, state, {
            data: state.data.filter(function (i) {
              return i[_this8.config.options.uidKey] !== payload.data[_this8.config.options.uidKey];
            }),
            meta: Object.assign({}, state.meta, payload.meta)
          });
        }
      };
    };

    fragment.getOptions = function (verb, params) {
      return Object.assign({ client: _superagent2.default }, this.config.options, (0, _itsSet2.default)(verb, 'options') ? verb.options(params) : {});
    };

    fragment.getDefaultVerb = function () {
      return this.config[this.config.options.defaultVerb];
    };

    return fragment;
  };
});