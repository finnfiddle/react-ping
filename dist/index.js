'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createResource = exports.createContainer = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _Fragments = require('./Fragments');

var _Fragments2 = _interopRequireDefault(_Fragments);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createContainer = exports.createContainer = function createContainer(config, WrappedComponent) {
  return function (_Component) {
    (0, _inherits3.default)(_class2, _Component);

    function _class2() {
      var _ref;

      var _temp, _this, _ret;

      (0, _classCallCheck3.default)(this, _class2);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = _class2.__proto__ || (0, _getPrototypeOf2.default)(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    (0, _createClass3.default)(_class2, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this2 = this;

        this.listeners = [];
        this.fragments = (0, _Fragments2.default)(config, this);
        this.store = (0, _redux.createStore)(this.fragments.getReducer());
        this.store.subscribe(function () {
          _this2.setState(_this2.store.getState());
        });
        this.fragments.listen(this);
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.emit('fetch', this.getPayload());
      }
    }, {
      key: 'render',
      value: function render() {
        var _this3 = this;

        return _react2.default.createElement(WrappedComponent, (0, _extends3.default)({
          ref: function ref(c) {
            _this3.wrapped = c;
          }
        }, this.props, this.state, {
          ping: this.getMutator()
        }));
      }
    }, {
      key: 'getMutator',
      value: function getMutator() {
        var _this4 = this;

        return (0, _keys2.default)(this.fragments.definitions).reduce(function (acc, key) {
          return (0, _assign2.default)({}, acc, (0, _defineProperty3.default)({}, key, _this4.fragments.definitions[key].getMutator()));
        }, {});
      }
    }, {
      key: 'getPayload',
      value: function getPayload(customParams) {
        return (0, _assign2.default)({}, { props: this.props, state: (0, _get2.default)(this, 'wrapped.state') }, customParams);
      }
    }, {
      key: 'addListener',
      value: function addListener(listener) {
        this.listeners.push(listener);
      }
    }, {
      key: 'emit',
      value: function emit(type, payload) {
        this.listeners.forEach(function (listener) {
          listener.on(type, payload);
        });
      }
    }, {
      key: 'on',
      value: function on(type, payload) {
        switch (type) {
          case 'dispatch':
            {
              this.store.dispatch(payload);
              break;
            }
        }
      }
    }]);
    return _class2;
  }(_react.Component);
};

var createResource = exports.createResource = function createResource(resourceConfig) {
  return (0, _assign2.default)({}, resourceConfig, { isResource: true });
};