(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'redux', './Fragment', './ResourceFragment'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('redux'), require('./Fragment'), require('./ResourceFragment'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.redux, global.Fragment, global.ResourceFragment);
    global.Fragments = mod.exports;
  }
})(this, function (exports, _redux, _Fragment, _ResourceFragment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _Fragment2 = _interopRequireDefault(_Fragment);

  var _ResourceFragment2 = _interopRequireDefault(_ResourceFragment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  exports.default = function (config) {
    var fragments = {};

    fragments.definitions = Object.keys(config).reduce(function (acc, key) {
      var fragmentConfig = config[key];
      return Object.assign({}, acc, _defineProperty({}, key, fragmentConfig.isResource ? (0, _ResourceFragment2.default)(key, fragmentConfig) : (0, _Fragment2.default)(key, fragmentConfig)));
    }, {});

    fragments.listen = function (emitter) {
      Object.keys(fragments.definitions).forEach(function (key) {
        emitter.addListener(fragments.definitions[key]);
        fragments.definitions[key].addListener(emitter);
      });
    };

    fragments.getReducer = function () {
      return (0, _redux.combineReducers)(Object.keys(fragments.definitions).reduce(function (acc, key) {
        return Object.assign({}, acc, _defineProperty({}, key, fragments.definitions[key].getReducer(key)));
      }, {}));
    };

    return fragments;
  };
});