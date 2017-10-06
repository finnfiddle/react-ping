'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _redux = require('redux');

var _Fragment = require('./Fragment');

var _Fragment2 = _interopRequireDefault(_Fragment);

var _ResourceFragment = require('./ResourceFragment');

var _ResourceFragment2 = _interopRequireDefault(_ResourceFragment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config, container) {

  var fragments = { container: container };

  fragments.definitions = (0, _keys2.default)(config).reduce(function (acc, key) {
    var fragmentConfig = config[key];
    return (0, _assign2.default)({}, acc, (0, _defineProperty3.default)({}, key, fragmentConfig.isResource ? (0, _ResourceFragment2.default)(key, fragmentConfig, container) : (0, _Fragment2.default)(key, fragmentConfig, container)));
  }, {});

  fragments.listen = function (emitter) {
    (0, _keys2.default)(fragments.definitions).forEach(function (key) {
      emitter.addListener(fragments.definitions[key]);
      fragments.definitions[key].addListener(emitter);
    });
  };

  fragments.getReducer = function () {
    return (0, _redux.combineReducers)((0, _keys2.default)(fragments.definitions).reduce(function (acc, key) {
      return (0, _assign2.default)({}, acc, (0, _defineProperty3.default)({}, key, fragments.definitions[key].getReducer(key)));
    }, {}));
  };

  return fragments;
};