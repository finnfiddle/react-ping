(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'react', 'redux', 'lodash/get', './Fragments'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('react'), require('redux'), require('lodash/get'), require('./Fragments'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.react, global.redux, global.get, global.Fragments);
    global.index = mod.exports;
  }
})(this, function (exports, _react, _redux, _get, _Fragments) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createResource = exports.createContainer = undefined;

  var _react2 = _interopRequireDefault(_react);

  var _get2 = _interopRequireDefault(_get);

  var _Fragments2 = _interopRequireDefault(_Fragments);

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

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var createContainer = exports.createContainer = function createContainer(config, WrappedComponent) {
    return function (_Component) {
      _inherits(_class2, _Component);

      function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(_class2, [{
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

          return _react2.default.createElement(WrappedComponent, _extends({
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

          return Object.keys(this.fragments.definitions).reduce(function (acc, key) {
            return Object.assign({}, acc, _defineProperty({}, key, _this4.fragments.definitions[key].getMutator()));
          }, {});
        }
      }, {
        key: 'getPayload',
        value: function getPayload(customParams) {
          return Object.assign({}, { props: this.props, state: (0, _get2.default)(this, 'wrapped.state') }, customParams);
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
    return Object.assign({}, resourceConfig, { isResource: true });
  };
});