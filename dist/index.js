(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'react'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('react'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.react);
    global.index = mod.exports;
  }
})(this, function (exports, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
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

  // keyboard key codes
  var KEY_CODES = {
    ENTER: 13
  };

  // same as lodash.omit
  var omit = function omit(obj, keys) {
    var result = Object.assign({}, obj);
    keys.forEach(function (key) {
      return delete result[key];
    });
    return result;
  };

  var noop = function noop() {};

  // check if value is not null and not undefined
  var isSet = function isSet(val) {
    return val !== null && typeof val !== 'undefined';
  };

  var DeferredInput = function (_Component) {
    _inherits(DeferredInput, _Component);

    function DeferredInput() {
      _classCallCheck(this, DeferredInput);

      var _this = _possibleConstructorReturn(this, (DeferredInput.__proto__ || Object.getPrototypeOf(DeferredInput)).call(this));

      // initial state
      _this.state = { value: '' };
      return _this;
    }

    _createClass(DeferredInput, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        // update state with props
        this.setState({ value: this.props.value || '' });
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        // focus on element when it mounts if `props.focusOnMount` is set to true
        if (this.props.focusOnMount) {
          setTimeout(function () {
            return _this2.focus.call(_this2);
          }, 500);
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        // update value if new value prop is received
        if (this.props.value !== nextProps.value) {
          this.setState({ value: nextProps.value });
        }
      }
    }, {
      key: 'handleChange',
      value: function handleChange(event) {
        this.setState({ value: event.target.value });
      }
    }, {
      key: 'handleBlur',
      value: function handleBlur() {
        // call `props.onBlur` if set
        this.props.onBlur(this.state.value);
        // call `props.onChange` of provided and value is changed
        if (isSet(this.props.onChange) && this.state.value !== this.props.value) {
          this.props.onChange(this.state.value);
        }
        // if `props.clearOnChange` is true then clear the input when blurred
        if (this.props.clearOnChange) this.setState({ value: '' });
      }
    }, {
      key: 'getChildProps',
      value: function getChildProps() {
        var privateProps = ['value', 'onChange', 'onBlur', 'isInput', 'onKeyDown', 'blurOnEnter', 'focusOnMount', 'clearOnChange', 'inputComponent'];

        return Object.assign({}, omit(this.props, privateProps), {
          value: isSet(this.state.value) ? this.state.value : '',
          onChange: this.handleChange.bind(this),
          onBlur: this.handleBlur.bind(this),
          onKeyDown: this.handleKeyDown.bind(this)
        });
      }
    }, {
      key: 'callMethodOnElementOrChild',
      value: function callMethodOnElementOrChild(element, action) {
        var _this3 = this;

        if (['TEXTAREA', 'INPUT'].indexOf(element.tagName) > -1) {
          return element[action]();
        } else if (typeof element.childNodes !== 'undefined' && element.childNodes.length) {
          [].forEach.call(element.childNodes, function (child) {
            return _this3.callMethodOnElementOrChild(child, action);
          });
        }
      }
    }, {
      key: 'blur',
      value: function blur() {
        this.callMethodOnElementOrChild(this.input, 'blur');
      }
    }, {
      key: 'focus',
      value: function focus() {
        this.callMethodOnElementOrChild(this.input, 'focus');
      }
    }, {
      key: 'handleKeyDown',
      value: function handleKeyDown(event) {
        // if `props.blurOnEnter` and key pressed is ENTER then call blur()
        if (this.props.blurOnEnter && event.keyCode === KEY_CODES.ENTER && !event.shiftKey) {
          this.blur.call(this);
        }
        if (this.props.onKeyDown) this.props.onKeyDown(event);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this4 = this;

        return _react2.default.createElement(this.props.inputComponent, _extends({}, this.getChildProps(), {
          ref: function ref(c) {
            _this4.input = c;
          }
        }));
      }
    }]);

    return DeferredInput;
  }(_react.Component);

  DeferredInput.defaultProps = {
    blurOnEnter: false,
    focusOnMount: false,
    onBlur: noop,
    clearOnChange: false,
    inputComponent: 'input'
  };

  exports.default = DeferredInput;
});