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
      } }),
    read: Object.assign({}, _Fragment.FRAGMENT_DEFAULTS),
    update: Object.assign({}, _Fragment.FRAGMENT_DEFAULTS, { method: function method() {
        return 'PUT';
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
      }
    },
    options: {
      defaultVerb: 'list',
      uidKey: 'id',
      mergeList: function mergeList(state, list) {
        return list;
      },
      mergeItem: function mergeItem(state, item) {
        var _this = this;

        var needle = state.filter(function (i) {
          return i[_this.uidKey] === item[_this.uidKey];
        })[0];
        if ((0, _itsSet2.default)(needle)) {
          Object.assign(needle, item);
        } else {
          return state.concat(item);
        }
        return state;
      },
      addItem: function addItem(state, item) {
        return state.concat(item);
      },
      removeItem: function removeItem(state, item) {
        var _this2 = this;

        return state.filter(function (i) {
          return i[_this2.uidKey] !== item[_this2.uidKey];
        });
      }
    }
  };

  var WHITELIST_EVENT_TYPES = ['fetch', 'list', 'create', 'read', 'update', 'del'];

  exports.default = function (key, config) {

    var fragment = { key: key };

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

    fragment.fetch = function (payload) {
      var _this3 = this;

      var DEFAULT_VERB = this.config.options.defaultVerb.toUpperCase();
      return this.ping(this.getDefaultVerb(), payload).then(function (response) {
        _this3.emit('dispatch', { type: key + '::' + DEFAULT_VERB + '_SUCCESS', payload: response });
      }).catch(function (error) {
        _this3.emit('request_error', error);
      });
    };

    fragment.list = function (payload) {
      var _this4 = this;

      return this.ping(this.config.list, payload).then(function (response) {
        _this4.emit('dispatch', { type: key + '::LIST_SUCCESS', payload: response });
      }).catch(function (error) {
        _this4.emit('request_error', error);
      });
    };

    fragment.create = function (payload) {
      var _this5 = this;

      return this.ping(this.config.create, payload).then(function (response) {
        _this5.emit('dispatch', { type: key + '::CREATE_SUCCESS', payload: response });
      }).catch(function (error) {
        _this5.emit('request_error', error);
      });
    };

    fragment.read = function (payload) {
      var _this6 = this;

      return this.ping(this.config.read, payload).then(function (response) {
        _this6.emit('dispatch', { type: key + '::READ_SUCCESS', payload: response });
      }).catch(function (error) {
        _this6.emit('request_error', error);
      });
    };

    fragment.update = function (payload) {
      var _this7 = this;

      return this.ping(this.config.update, payload).then(function (response) {
        _this7.emit('dispatch', { type: key + '::UPDATE_SUCCESS', payload: response });
      }).catch(function (error) {
        _this7.emit('request_error', error);
      });
    };

    fragment.del = function (payload) {
      var _this8 = this;

      return this.ping(this.config.del, payload).then(function (response) {
        _this8.emit('dispatch', { type: key + '::DEL_SUCCESS', payload: response });
      }).catch(function (error) {
        _this8.emit('request_error', error);
      });
    };

    fragment.ping = function (verb, params) {
      var allHeaders = this.config.all.headers(params);
      var allQuery = this.config.all.query(params);
      var baseUrl = this.config.baseUrl(params);
      return this.getOptions(verb, params).client(verb.method(params), '' + baseUrl + verb.url(params)).set(Object.assign({}, allHeaders, verb.headers(params))).query(Object.assign({}, allQuery, verb.query(params)));
    };

    fragment.getMutator = function (payload) {
      var _this9 = this;

      return {
        list: function list(customParams) {
          return _this9.list.call(_this9, Object.assign({}, payload, customParams));
        },
        create: function create(customParams) {
          return _this9.create.call(_this9, Object.assign({}, payload, customParams));
        },
        read: function read(customParams) {
          return _this9.read.call(_this9, Object.assign({}, payload, customParams));
        },
        update: function update(customParams) {
          return _this9.update.call(_this9, Object.assign({}, payload, customParams));
        },
        del: function del(customParams) {
          return _this9.del.call(_this9, Object.assign({}, payload, customParams));
        }
      };
    };

    fragment.getReducer = function (key) {
      var options = this.getOptions();
      return options.reducer || function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var action = arguments[1];

        if (action.type.indexOf(key + '::') === -1) return state;
        if (action.type === key + '::LIST_SUCCESS') {
          return options.mergeList(state, action.payload);
        }
        if (action.type === key + '::CREATE_SUCCESS') {
          return options.addItem(state, action.payload);
        }
        if (action.type === key + '::UPDATE_SUCCESS' || action.type === key + '::READ_SUCCESS') {
          return options.mergeItem(state, action.payload);
        }
        if (action.type === key + '::DEL_SUCCESS') {
          return options.removeItem(state, action.payload);
        }
        return state;
      };
    };

    fragment.getOptions = function (verb, params) {
      return Object.assign({ client: _superagent2.default }, this.config.options, (0, _itsSet2.default)(verb) ? verb.options(params) : {});
    };

    fragment.getDefaultVerb = function () {
      return this.config[this.config.options.defaultVerb];
    };

    return fragment;
  };
});