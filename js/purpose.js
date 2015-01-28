/* Version: 0.18.0 (f0b4a755fdd05226c78a424b05e91349e59f8248) */
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Purpose=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("A/cN+7"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"A/cN+7":3,"inherits":2}],6:[function(_dereq_,module,exports){
// =========
// = humps =
// =========
// version 0.4.1
// Underscore-to-camelCase converter (and vice versa)
// for strings and object keys

// humps is copyright © 2013 Dom Christie
// Released under the MIT license.


;(function(global) {

  var _processKeys = function(convert, obj, separator) {
    if(!_isObject(obj) || _isDate(obj) || _isRegExp(obj)) {
      return obj;
    }

    var output,
        i = 0,
        l = 0;

    if(_isArray(obj)) {
      output = [];
      for(l=obj.length; i<l; i++) {
        output.push(_processKeys(convert, obj[i], separator));
      }
    }
    else {
      output = {};
      for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
          var val = obj[key];
          if(_isArray(val)) {
            var convertedArray = [];
            i = 0;
            for(l=val.length; i<l; i++) {
              convertedArray.push(_processKeys(convert, val[i], separator));
            }
            output[convert(key, separator)] = convertedArray;
          }
          else if(_isObject(val)) {
            output[convert(key, separator)] =
              _processKeys(convert, val, separator);
          }
          else {
            output[convert(key, separator)] = val;
          }
        }
      }
    }
    return output;
  };

  // String conversion methods

  var separateWords = function(string, separator) {
    if (separator === undefined) {
      separator = '_';
    }
    return string.replace(/([a-z])([A-Z0-9])/g, '$1'+ separator +'$2');
  };

  var camelize = function(string) {
    string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
    // Ensure 1st char is always lowercase
    return string.replace(/^([A-Z])/, function(match, chr) {
      return chr ? chr.toLowerCase() : '';
    });
  };

  var pascalize = function(string) {
    return camelize(string).replace(/^([a-z])/, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  };

  var decamelize = function(string, separator) {
    return separateWords(string, separator).toLowerCase();
  };

  // Utilities
  // Taken from Underscore.js

  var toString = Object.prototype.toString;

  var _isObject = function(obj) {
    return obj === Object(obj);
  };
  var _isArray = function(obj) {
    return toString.call(obj) == '[object Array]';
  };
  var _isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };
  var _isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  var humps = {
    camelize: camelize,
    decamelize: decamelize,
    pascalize: pascalize,
    depascalize: decamelize,
    camelizeKeys: function(object) {
      return _processKeys(camelize, object);
    },
    decamelizeKeys: function(object, separator) {
      return _processKeys(decamelize, object, separator);
    },
    pascalizeKeys: function(object) {
      return _processKeys(pascalize, object);
    },
    depascalizeKeys: this.decamelizeKeys
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = humps;
  } else {
    global.humps = humps;
  }

})(this);

},{}],7:[function(_dereq_,module,exports){
(function (process){
/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.0.16
 */

(function() {
    "use strict";
    function $$rsvp$events$$indexOf(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
      }

      return -1;
    }

    function $$rsvp$events$$callbacksFor(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    }

    var $$rsvp$events$$default = {

      /**
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on('finished', function(event) {
          // handle event
        });

        object.trigger('finished', { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on('poke', function(event) {
          console.log('Yehuda says OW');
        });

        tom.on('poke', function(event) {
          console.log('Tom says OW');
        });

        yehuda.trigger('poke');
        tom.trigger('poke');
        ```

        @method mixin
        @for RSVP.EventTarget
        @private
        @param {Object} object object to extend with EventTarget methods
      */
      'mixin': function(object) {
        object['on']      = this['on'];
        object['off']     = this['off'];
        object['trigger'] = this['trigger'];
        object._promiseCallbacks = undefined;
        return object;
      },

      /**
        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */
      'on': function(eventName, callback) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if ($$rsvp$events$$indexOf(callbacks, callback) === -1) {
          callbacks.push(callback);
        }
      },

      /**
        You can use `off` to stop firing a particular callback for an event:

        ```javascript
        function doStuff() { // do stuff! }
        object.on('stuff', doStuff);

        object.trigger('stuff'); // doStuff will be called

        // Unregister ONLY the doStuff callback
        object.off('stuff', doStuff);
        object.trigger('stuff'); // doStuff will NOT be called
        ```

        If you don't pass a `callback` argument to `off`, ALL callbacks for the
        event will not be executed when the event fires. For example:

        ```javascript
        var callback1 = function(){};
        var callback2 = function(){};

        object.on('stuff', callback1);
        object.on('stuff', callback2);

        object.trigger('stuff'); // callback1 and callback2 will be executed.

        object.off('stuff');
        object.trigger('stuff'); // callback1 and callback2 will not be executed!
        ```

        @method off
        @for RSVP.EventTarget
        @private
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */
      'off': function(eventName, callback) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = $$rsvp$events$$indexOf(callbacks, callback);

        if (index !== -1) { callbacks.splice(index, 1); }
      },

      /**
        Use `trigger` to fire custom events. For example:

        ```javascript
        object.on('foo', function(){
          console.log('foo event happened!');
        });
        object.trigger('foo');
        // 'foo event happened!' logged to the console
        ```

        You can also pass a value as a second argument to `trigger` that will be
        passed as an argument to all event listeners for the event:

        ```javascript
        object.on('foo', function(value){
          console.log(value.name);
        });

        object.trigger('foo', { name: 'bar' });
        // 'bar' logged to the console
        ```

        @method trigger
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to be triggered
        @param {Any} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      'trigger': function(eventName, options) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks, callback;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options);
          }
        }
      }
    };

    var $$rsvp$config$$config = {
      instrument: false
    };

    $$rsvp$events$$default['mixin']($$rsvp$config$$config);

    function $$rsvp$config$$configure(name, value) {
      if (name === 'onerror') {
        // handle for legacy users that expect the actual
        // error to be passed to their function added via
        // `RSVP.configure('onerror', someFunctionHere);`
        $$rsvp$config$$config['on']('error', value);
        return;
      }

      if (arguments.length === 2) {
        $$rsvp$config$$config[name] = value;
      } else {
        return $$rsvp$config$$config[name];
      }
    }

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;
    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;

    var $$utils$$now = Date.now || function() { return new Date().getTime(); };

    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$instrument$$queue = [];

    function $$instrument$$scheduleFlush() {
      setTimeout(function() {
        var entry;
        for (var i = 0; i < $$instrument$$queue.length; i++) {
          entry = $$instrument$$queue[i];

          var payload = entry.payload;

          payload.guid = payload.key + payload.id;
          payload.childGuid = payload.key + payload.childId;
          if (payload.error) {
            payload.stack = payload.error.stack;
          }

          $$rsvp$config$$config['trigger'](entry.name, entry.payload);
        }
        $$instrument$$queue.length = 0;
      }, 50);
    }

    function $$instrument$$instrument(eventName, promise, child) {
      if (1 === $$instrument$$queue.push({
          name: eventName,
          payload: {
            key: promise._guidKey,
            id:  promise._id,
            eventName: eventName,
            detail: promise._result,
            childId: child && child._id,
            label: promise._label,
            timeStamp: $$utils$$now(),
            error: $$rsvp$config$$config["instrument-with-stack"] ? new Error(promise._label) : null
          }})) {
            $$instrument$$scheduleFlush();
          }
      }
    var $$instrument$$default = $$instrument$$instrument;

    function  $$$internal$$withOwnPromise() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function $$$internal$$noop() {}

    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;

    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
      $$rsvp$config$$config.async(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === $$$internal$$REJECTED) {
        thenable._onError = null;
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$fulfill(promise, value);
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onError) {
        promise._onError(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
        if ($$rsvp$config$$config.instrument) {
          $$instrument$$default('fulfilled', promise);
        }
      } else {
        $$rsvp$config$$config.async($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;
      $$rsvp$config$$config.async($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onError = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$rsvp$config$$config.async($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if ($$rsvp$config$$config.instrument) {
        $$instrument$$default(settled === $$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, $$$internal$$withOwnPromise());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      var resolved = false;
      try {
        resolver(function resolvePromise(value){
          if (resolved) { return; }
          resolved = true;
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          if (resolved) { return; }
          resolved = true;
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
        return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function $$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    var $$enumerator$$default = $$enumerator$$Enumerator;

    $$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    $$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onError = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };
    function $$promise$all$$all(entries, label) {
      return new $$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    }
    var $$promise$all$$default = $$promise$all$$all;
    function $$promise$race$$race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var $$promise$race$$default = $$promise$race$$race;
    function $$promise$resolve$$resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    }
    var $$promise$resolve$$default = $$promise$resolve$$resolve;
    function $$promise$reject$$reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    }
    var $$promise$reject$$default = $$promise$reject$$reject;

    var $$rsvp$promise$$guidKey = 'rsvp_' + $$utils$$now() + '-';
    var $$rsvp$promise$$counter = 0;

    function $$rsvp$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$rsvp$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class RSVP.Promise
      @param {function} resolver
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @constructor
    */
    function $$rsvp$promise$$Promise(resolver, label) {
      this._id = $$rsvp$promise$$counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$rsvp$config$$config.instrument) {
        $$instrument$$default('created', this);
      }

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$rsvp$promise$$needsResolver();
        }

        if (!(this instanceof $$rsvp$promise$$Promise)) {
          $$rsvp$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    var $$rsvp$promise$$default = $$rsvp$promise$$Promise;

    // deprecated
    $$rsvp$promise$$Promise.cast = $$promise$resolve$$default;
    $$rsvp$promise$$Promise.all = $$promise$all$$default;
    $$rsvp$promise$$Promise.race = $$promise$race$$default;
    $$rsvp$promise$$Promise.resolve = $$promise$resolve$$default;
    $$rsvp$promise$$Promise.reject = $$promise$reject$$default;

    $$rsvp$promise$$Promise.prototype = {
      constructor: $$rsvp$promise$$Promise,

      _guidKey: $$rsvp$promise$$guidKey,

      _onError: function (reason) {
        $$rsvp$config$$config.async(function(promise) {
          setTimeout(function() {
            if (promise._onError) {
              $$rsvp$config$$config['trigger']('error', reason);
            }
          }, 0);
        }, this);
      },

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection, label) {
        var parent = this;
        var state = parent._state;

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          if ($$rsvp$config$$config.instrument) {
            $$instrument$$default('chained', this, this);
          }
          return this;
        }

        parent._onError = null;

        var child = new this.constructor($$$internal$$noop, label);
        var result = parent._result;

        if ($$rsvp$config$$config.instrument) {
          $$instrument$$default('chained', parent, child);
        }

        if (state) {
          var callback = arguments[state - 1];
          $$rsvp$config$$config.async(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection, label) {
        return this.then(null, onRejection, label);
      },

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves

      Synchronous example:

      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }

      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```

      Asynchronous example:

      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```

      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'finally': function(callback, label) {
        var constructor = this.constructor;

        return this.then(function(value) {
          return constructor.resolve(callback()).then(function(){
            return value;
          });
        }, function(reason) {
          return constructor.resolve(callback()).then(function(){
            throw reason;
          });
        }, label);
      }
    };

    function $$rsvp$node$$Result() {
      this.value = undefined;
    }

    var $$rsvp$node$$ERROR = new $$rsvp$node$$Result();
    var $$rsvp$node$$GET_THEN_ERROR = new $$rsvp$node$$Result();

    function $$rsvp$node$$getThen(obj) {
      try {
       return obj.then;
      } catch(error) {
        $$rsvp$node$$ERROR.value= error;
        return $$rsvp$node$$ERROR;
      }
    }


    function $$rsvp$node$$tryApply(f, s, a) {
      try {
        f.apply(s, a);
      } catch(error) {
        $$rsvp$node$$ERROR.value = error;
        return $$rsvp$node$$ERROR;
      }
    }

    function $$rsvp$node$$makeObject(_, argumentNames) {
      var obj = {};
      var name;
      var i;
      var length = _.length;
      var args = new Array(length);

      for (var x = 0; x < length; x++) {
        args[x] = _[x];
      }

      for (i = 0; i < argumentNames.length; i++) {
        name = argumentNames[i];
        obj[name] = args[i + 1];
      }

      return obj;
    }

    function $$rsvp$node$$arrayResult(_) {
      var length = _.length;
      var args = new Array(length - 1);

      for (var i = 1; i < length; i++) {
        args[i - 1] = _[i];
      }

      return args;
    }

    function $$rsvp$node$$wrapThenable(then, promise) {
      return {
        then: function(onFulFillment, onRejection) {
          return then.call(promise, onFulFillment, onRejection);
        }
      };
    }

    function $$rsvp$node$$denodeify(nodeFunc, options) {
      var fn = function() {
        var self = this;
        var l = arguments.length;
        var args = new Array(l + 1);
        var arg;
        var promiseInput = false;

        for (var i = 0; i < l; ++i) {
          arg = arguments[i];

          if (!promiseInput) {
            // TODO: clean this up
            promiseInput = $$rsvp$node$$needsPromiseInput(arg);
            if (promiseInput === $$rsvp$node$$GET_THEN_ERROR) {
              var p = new $$rsvp$promise$$default($$$internal$$noop);
              $$$internal$$reject(p, $$rsvp$node$$GET_THEN_ERROR.value);
              return p;
            } else if (promiseInput && promiseInput !== true) {
              arg = $$rsvp$node$$wrapThenable(promiseInput, arg);
            }
          }
          args[i] = arg;
        }

        var promise = new $$rsvp$promise$$default($$$internal$$noop);

        args[l] = function(err, val) {
          if (err)
            $$$internal$$reject(promise, err);
          else if (options === undefined)
            $$$internal$$resolve(promise, val);
          else if (options === true)
            $$$internal$$resolve(promise, $$rsvp$node$$arrayResult(arguments));
          else if ($$utils$$isArray(options))
            $$$internal$$resolve(promise, $$rsvp$node$$makeObject(arguments, options));
          else
            $$$internal$$resolve(promise, val);
        };

        if (promiseInput) {
          return $$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
        } else {
          return $$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
        }
      };

      fn.__proto__ = nodeFunc;

      return fn;
    }

    var $$rsvp$node$$default = $$rsvp$node$$denodeify;

    function $$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
      var result = $$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === $$rsvp$node$$ERROR) {
        $$$internal$$reject(promise, result.value);
      }
      return promise;
    }

    function $$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){
      return $$rsvp$promise$$default.all(args).then(function(args){
        var result = $$rsvp$node$$tryApply(nodeFunc, self, args);
        if (result === $$rsvp$node$$ERROR) {
          $$$internal$$reject(promise, result.value);
        }
        return promise;
      });
    }

    function $$rsvp$node$$needsPromiseInput(arg) {
      if (arg && typeof arg === 'object') {
        if (arg.constructor === $$rsvp$promise$$default) {
          return true;
        } else {
          return $$rsvp$node$$getThen(arg);
        }
      } else {
        return false;
      }
    }
    function $$rsvp$all$$all(array, label) {
      return $$rsvp$promise$$default.all(array, label);
    }
    var $$rsvp$all$$default = $$rsvp$all$$all;

    function $$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);
    }

    $$rsvp$all$settled$$AllSettled.prototype = $$utils$$o_create($$enumerator$$default.prototype);
    $$rsvp$all$settled$$AllSettled.prototype._superConstructor = $$enumerator$$default;
    $$rsvp$all$settled$$AllSettled.prototype._makeResult = $$enumerator$$makeSettledResult;
    $$rsvp$all$settled$$AllSettled.prototype._validationError = function() {
      return new Error('allSettled must be called with an array');
    };

    function $$rsvp$all$settled$$allSettled(entries, label) {
      return new $$rsvp$all$settled$$AllSettled($$rsvp$promise$$default, entries, label).promise;
    }
    var $$rsvp$all$settled$$default = $$rsvp$all$settled$$allSettled;
    function $$rsvp$race$$race(array, label) {
      return $$rsvp$promise$$default.race(array, label);
    }
    var $$rsvp$race$$default = $$rsvp$race$$race;

    function $$promise$hash$$PromiseHash(Constructor, object, label) {
      this._superConstructor(Constructor, object, true, label);
    }

    var $$promise$hash$$default = $$promise$hash$$PromiseHash;

    $$promise$hash$$PromiseHash.prototype = $$utils$$o_create($$enumerator$$default.prototype);
    $$promise$hash$$PromiseHash.prototype._superConstructor = $$enumerator$$default;
    $$promise$hash$$PromiseHash.prototype._init = function() {
      this._result = {};
    };

    $$promise$hash$$PromiseHash.prototype._validateInput = function(input) {
      return input && typeof input === 'object';
    };

    $$promise$hash$$PromiseHash.prototype._validationError = function() {
      return new Error('Promise.hash must be called with an object');
    };

    $$promise$hash$$PromiseHash.prototype._enumerate = function() {
      var promise = this.promise;
      var input   = this._input;
      var results = [];

      for (var key in input) {
        if (promise._state === $$$internal$$PENDING && input.hasOwnProperty(key)) {
          results.push({
            position: key,
            entry: input[key]
          });
        }
      }

      var length = results.length;
      this._remaining = length;
      var result;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        result = results[i];
        this._eachEntry(result.entry, result.position);
      }
    };
    function $$rsvp$hash$$hash(object, label) {
      return new $$promise$hash$$default($$rsvp$promise$$default, object, label).promise;
    }
    var $$rsvp$hash$$default = $$rsvp$hash$$hash;

    function $$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
      this._superConstructor(Constructor, object, false, label);
    }

    $$rsvp$hash$settled$$HashSettled.prototype = $$utils$$o_create($$promise$hash$$default.prototype);
    $$rsvp$hash$settled$$HashSettled.prototype._superConstructor = $$enumerator$$default;
    $$rsvp$hash$settled$$HashSettled.prototype._makeResult = $$enumerator$$makeSettledResult;

    $$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {
      return new Error('hashSettled must be called with an object');
    };

    function $$rsvp$hash$settled$$hashSettled(object, label) {
      return new $$rsvp$hash$settled$$HashSettled($$rsvp$promise$$default, object, label).promise;
    }
    var $$rsvp$hash$settled$$default = $$rsvp$hash$settled$$hashSettled;
    function $$rsvp$rethrow$$rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    }
    var $$rsvp$rethrow$$default = $$rsvp$rethrow$$rethrow;
    function $$rsvp$defer$$defer(label) {
      var deferred = { };

      deferred['promise'] = new $$rsvp$promise$$default(function(resolve, reject) {
        deferred['resolve'] = resolve;
        deferred['reject'] = reject;
      }, label);

      return deferred;
    }
    var $$rsvp$defer$$default = $$rsvp$defer$$defer;
    function $$rsvp$map$$map(promises, mapFn, label) {
      return $$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!$$utils$$isFunction(mapFn)) {
          throw new TypeError("You must pass a function as map's second argument.");
        }

        var length = values.length;
        var results = new Array(length);

        for (var i = 0; i < length; i++) {
          results[i] = mapFn(values[i]);
        }

        return $$rsvp$promise$$default.all(results, label);
      });
    }
    var $$rsvp$map$$default = $$rsvp$map$$map;
    function $$rsvp$resolve$$resolve(value, label) {
      return $$rsvp$promise$$default.resolve(value, label);
    }
    var $$rsvp$resolve$$default = $$rsvp$resolve$$resolve;
    function $$rsvp$reject$$reject(reason, label) {
      return $$rsvp$promise$$default.reject(reason, label);
    }
    var $$rsvp$reject$$default = $$rsvp$reject$$reject;
    function $$rsvp$filter$$filter(promises, filterFn, label) {
      return $$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!$$utils$$isFunction(filterFn)) {
          throw new TypeError("You must pass a function as filter's second argument.");
        }

        var length = values.length;
        var filtered = new Array(length);

        for (var i = 0; i < length; i++) {
          filtered[i] = filterFn(values[i]);
        }

        return $$rsvp$promise$$default.all(filtered, label).then(function(filtered) {
          var results = new Array(length);
          var newLength = 0;

          for (var i = 0; i < length; i++) {
            if (filtered[i]) {
              results[newLength] = values[i];
              newLength++;
            }
          }

          results.length = newLength;

          return results;
        });
      });
    }
    var $$rsvp$filter$$default = $$rsvp$filter$$filter;
    var $$rsvp$asap$$len = 0;

    function $$rsvp$asap$$asap(callback, arg) {
      $$rsvp$asap$$queue[$$rsvp$asap$$len] = callback;
      $$rsvp$asap$$queue[$$rsvp$asap$$len + 1] = arg;
      $$rsvp$asap$$len += 2;
      if ($$rsvp$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$rsvp$asap$$scheduleFlush();
      }
    }

    var $$rsvp$asap$$default = $$rsvp$asap$$asap;

    var $$rsvp$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var $$rsvp$asap$$browserGlobal = $$rsvp$asap$$browserWindow || {};
    var $$rsvp$asap$$BrowserMutationObserver = $$rsvp$asap$$browserGlobal.MutationObserver || $$rsvp$asap$$browserGlobal.WebKitMutationObserver;
    var $$rsvp$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var $$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$rsvp$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick($$rsvp$asap$$flush);
      };
    }

    // vertx
    function $$rsvp$asap$$useVertxTimer() {
      return function() {
        vertxNext($$rsvp$asap$$flush);
      };
    }

    function $$rsvp$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$rsvp$asap$$BrowserMutationObserver($$rsvp$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$rsvp$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$rsvp$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$rsvp$asap$$useSetTimeout() {
      return function() {
        setTimeout($$rsvp$asap$$flush, 1);
      };
    }

    var $$rsvp$asap$$queue = new Array(1000);
    function $$rsvp$asap$$flush() {
      for (var i = 0; i < $$rsvp$asap$$len; i+=2) {
        var callback = $$rsvp$asap$$queue[i];
        var arg = $$rsvp$asap$$queue[i+1];

        callback(arg);

        $$rsvp$asap$$queue[i] = undefined;
        $$rsvp$asap$$queue[i+1] = undefined;
      }

      $$rsvp$asap$$len = 0;
    }

    function $$rsvp$asap$$attemptVertex() {
      try {
        var vertx = _dereq_('vertx');
        var vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return $$rsvp$asap$$useVertxTimer();
      } catch(e) {
        return $$rsvp$asap$$useSetTimeout();
      }
    }

    var $$rsvp$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if ($$rsvp$asap$$isNode) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useNextTick();
    } else if ($$rsvp$asap$$BrowserMutationObserver) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useMutationObserver();
    } else if ($$rsvp$asap$$isWorker) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useMessageChannel();
    } else if ($$rsvp$asap$$browserWindow === undefined && typeof _dereq_ === 'function') {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$attemptVertex();
    } else {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useSetTimeout();
    }

    // default async is asap;
    $$rsvp$config$$config.async = $$rsvp$asap$$default;
    var $$rsvp$$cast = $$rsvp$resolve$$default;
    function $$rsvp$$async(callback, arg) {
      $$rsvp$config$$config.async(callback, arg);
    }

    function $$rsvp$$on() {
      $$rsvp$config$$config['on'].apply($$rsvp$config$$config, arguments);
    }

    function $$rsvp$$off() {
      $$rsvp$config$$config['off'].apply($$rsvp$config$$config, arguments);
    }

    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
      var $$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
      $$rsvp$config$$configure('instrument', true);
      for (var $$rsvp$$eventName in $$rsvp$$callbacks) {
        if ($$rsvp$$callbacks.hasOwnProperty($$rsvp$$eventName)) {
          $$rsvp$$on($$rsvp$$eventName, $$rsvp$$callbacks[$$rsvp$$eventName]);
        }
      }
    }

    var rsvp$umd$$RSVP = {
      'race': $$rsvp$race$$default,
      'Promise': $$rsvp$promise$$default,
      'allSettled': $$rsvp$all$settled$$default,
      'hash': $$rsvp$hash$$default,
      'hashSettled': $$rsvp$hash$settled$$default,
      'denodeify': $$rsvp$node$$default,
      'on': $$rsvp$$on,
      'off': $$rsvp$$off,
      'map': $$rsvp$map$$default,
      'filter': $$rsvp$filter$$default,
      'resolve': $$rsvp$resolve$$default,
      'reject': $$rsvp$reject$$default,
      'all': $$rsvp$all$$default,
      'rethrow': $$rsvp$rethrow$$default,
      'defer': $$rsvp$defer$$default,
      'EventTarget': $$rsvp$events$$default,
      'configure': $$rsvp$config$$configure,
      'async': $$rsvp$$async
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return rsvp$umd$$RSVP; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = rsvp$umd$$RSVP;
    } else if (typeof this !== 'undefined') {
      this['RSVP'] = rsvp$umd$$RSVP;
    }
}).call(this);

//# sourceMappingURL=rsvp.js.map
}).call(this,_dereq_("A/cN+7"))
},{"A/cN+7":3,"vertx":1}],8:[function(_dereq_,module,exports){
//
// strftime
// github.com/samsonjs/strftime
// @_sjs
//
// Copyright 2010 - 2013 Sami Samhuri <sami@samhuri.net>
//
// MIT License
// http://sjs.mit-license.org
//

;(function() {

  //// Where to export the API
  var namespace;

  // CommonJS / Node module
  if (typeof module !== 'undefined') {
    namespace = module.exports = strftime;
  }

  // Browsers and other environments
  else {
    // Get the global object. Works in ES3, ES5, and ES5 strict mode.
    namespace = (function(){ return this || (1,eval)('this') }());
  }

  function words(s) { return (s || '').split(' '); }

  var DefaultLocale =
  { days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday')
  , shortDays: words('Sun Mon Tue Wed Thu Fri Sat')
  , months: words('January February March April May June July August September October November December')
  , shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec')
  , AM: 'AM'
  , PM: 'PM'
  , am: 'am'
  , pm: 'pm'
  };

  namespace.strftime = strftime;
  function strftime(fmt, d, locale) {
    return _strftime(fmt, d, locale);
  }

  // locale is optional
  namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;
  function strftimeTZ(fmt, d, locale, timezone) {
    if ((typeof locale == 'number' || typeof locale == 'string') && timezone == null) {
      timezone = locale;
      locale = undefined;
    }
    return _strftime(fmt, d, locale, { timezone: timezone });
  }

  namespace.strftimeUTC = strftime.strftimeUTC = strftimeUTC;
  function strftimeUTC(fmt, d, locale) {
    return _strftime(fmt, d, locale, { utc: true });
  }

  namespace.localizedStrftime = strftime.localizedStrftime = localizedStrftime;
  function localizedStrftime(locale) {
    return function(fmt, d, options) {
      return strftime(fmt, d, locale, options);
    };
  }

  // d, locale, and options are optional, but you can't leave
  // holes in the argument list. If you pass options you have to pass
  // in all the preceding args as well.
  //
  // options:
  //   - locale   [object] an object with the same structure as DefaultLocale
  //   - timezone [number] timezone offset in minutes from GMT
  function _strftime(fmt, d, locale, options) {
    options = options || {};

    // d and locale are optional so check if d is really the locale
    if (d && !quacksLikeDate(d)) {
      locale = d;
      d = undefined;
    }
    d = d || new Date();

    locale = locale || DefaultLocale;
    locale.formats = locale.formats || {};

    // Hang on to this Unix timestamp because we might mess with it directly below.
    var timestamp = d.getTime();

    var tz = options.timezone;
    var tzType = typeof tz;

    if (options.utc || tzType == 'number' || tzType == 'string') {
      d = dateToUTC(d);
    }

    if (tz) {
      // ISO 8601 format timezone string, [-+]HHMM
      //
      // Convert to the number of minutes and it'll be applied to the date below.
      if (tzType == 'string') {
        var sign = tz[0] == '-' ? -1 : 1;
        var hours = parseInt(tz.slice(1, 3), 10);
        var mins = parseInt(tz.slice(3, 5), 10);
        tz = sign * ((60 * hours) + mins);
      }

      if (tzType) {
        d = new Date(d.getTime() + (tz * 60000));
      }
    }

    // Most of the specifiers supported by C's strftime, and some from Ruby.
    // Some other syntax extensions from Ruby are supported: %-, %_, and %0
    // to pad with nothing, space, or zero (respectively).
    return fmt.replace(/%([-_0]?.)/g, function(_, c) {
      var mod, padding;

      if (c.length == 2) {
        mod = c[0];
        // omit padding
        if (mod == '-') {
          padding = '';
        }
        // pad with space
        else if (mod == '_') {
          padding = ' ';
        }
        // pad with zero
        else if (mod == '0') {
          padding = '0';
        }
        else {
          // unrecognized, return the format
          return _;
        }
        c = c[1];
      }

      switch (c) {

        // Examples for new Date(0) in GMT

        // 'Thursday'
        case 'A': return locale.days[d.getDay()];

        // 'Thu'
        case 'a': return locale.shortDays[d.getDay()];

        // 'January'
        case 'B': return locale.months[d.getMonth()];

        // 'Jan'
        case 'b': return locale.shortMonths[d.getMonth()];

        // '19'
        case 'C': return pad(Math.floor(d.getFullYear() / 100), padding);

        // '01/01/70'
        case 'D': return _strftime(locale.formats.D || '%m/%d/%y', d, locale);

        // '01'
        case 'd': return pad(d.getDate(), padding);

        // '01'
        case 'e': return pad(d.getDate(), padding == null ? ' ' : padding);

        // '1970-01-01'
        case 'F': return _strftime(locale.formats.F || '%Y-%m-%d', d, locale);

        // '00'
        case 'H': return pad(d.getHours(), padding);

        // 'Jan'
        case 'h': return locale.shortMonths[d.getMonth()];

        // '12'
        case 'I': return pad(hours12(d), padding);

        // '000'
        case 'j':
          var y = new Date(d.getFullYear(), 0, 1);
          var day = Math.ceil((d.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
          return pad(day, 3);

        // ' 0'
        case 'k': return pad(d.getHours(), padding == null ? ' ' : padding);

        // '000'
        case 'L': return pad(Math.floor(timestamp % 1000), 3);

        // '12'
        case 'l': return pad(hours12(d), padding == null ? ' ' : padding);

        // '00'
        case 'M': return pad(d.getMinutes(), padding);

        // '01'
        case 'm': return pad(d.getMonth() + 1, padding);

        // '\n'
        case 'n': return '\n';

        // '1st'
        case 'o': return String(d.getDate()) + ordinal(d.getDate());

        // 'am'
        case 'P': return d.getHours() < 12 ? locale.am : locale.pm;

        // 'AM'
        case 'p': return d.getHours() < 12 ? locale.AM : locale.PM;

        // '00:00'
        case 'R': return _strftime(locale.formats.R || '%H:%M', d, locale);

        // '12:00:00 AM'
        case 'r': return _strftime(locale.formats.r || '%I:%M:%S %p', d, locale);

        // '00'
        case 'S': return pad(d.getSeconds(), padding);

        // '0'
        case 's': return Math.floor(timestamp / 1000);

        // '00:00:00'
        case 'T': return _strftime(locale.formats.T || '%H:%M:%S', d, locale);

        // '\t'
        case 't': return '\t';

        // '00'
        case 'U': return pad(weekNumber(d, 'sunday'), padding);

        // '4'
        case 'u':
          var day = d.getDay();
          return day == 0 ? 7 : day; // 1 - 7, Monday is first day of the week

        // ' 1-Jan-1970'
        case 'v': return _strftime(locale.formats.v || '%e-%b-%Y', d, locale);

        // '00'
        case 'W': return pad(weekNumber(d, 'monday'), padding);

        // '4'
        case 'w': return d.getDay(); // 0 - 6, Sunday is first day of the week

        // '1970'
        case 'Y': return d.getFullYear();

        // '70'
        case 'y':
          var y = String(d.getFullYear());
          return y.slice(y.length - 2);

        // 'GMT'
        case 'Z':
          if (options.utc) {
            return "GMT";
          }
          else {
            var tzString = d.toString().match(/\(([\w\s]+)\)/);
            return tzString && tzString[1] || '';
          }

        // '+0000'
        case 'z':
          if (options.utc) {
            return "+0000";
          }
          else {
            var off = typeof tz == 'number' ? tz : -d.getTimezoneOffset();
            return (off < 0 ? '-' : '+') + pad(Math.floor(Math.abs(off) / 60)) + pad(Math.abs(off) % 60);
          }

        default: return c;
      }
    });
  }

  function dateToUTC(d) {
    var msDelta = (d.getTimezoneOffset() || 0) * 60000;
    return new Date(d.getTime() + msDelta);
  }

  var RequiredDateMethods = ['getTime', 'getTimezoneOffset', 'getDay', 'getDate', 'getMonth', 'getFullYear', 'getYear', 'getHours', 'getMinutes', 'getSeconds'];
  function quacksLikeDate(x) {
    var i = 0
      , n = RequiredDateMethods.length
      ;
    for (i = 0; i < n; ++i) {
      if (typeof x[RequiredDateMethods[i]] != 'function') {
        return false;
      }
    }
    return true;
  }

  // Default padding is '0' and default length is 2, both are optional.
  function pad(n, padding, length) {
    // pad(n, <length>)
    if (typeof padding === 'number') {
      length = padding;
      padding = '0';
    }

    // Defaults handle pad(n) and pad(n, <padding>)
    if (padding == null) {
      padding = '0';
    }
    length = length || 2;

    var s = String(n);
    // padding may be an empty string, don't loop forever if it is
    if (padding) {
      while (s.length < length) s = padding + s;
    }
    return s;
  }

  function hours12(d) {
    var hour = d.getHours();
    if (hour == 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return hour;
  }

  // Get the ordinal suffix for a number: st, nd, rd, or th
  function ordinal(n) {
    var i = n % 10
      , ii = n % 100
      ;
    if ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) {
      return 'th';
    }
    switch (i) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
    }
  }

  // firstWeekday: 'sunday' or 'monday', default is 'sunday'
  //
  // Pilfered & ported from Ruby's strftime implementation.
  function weekNumber(d, firstWeekday) {
    firstWeekday = firstWeekday || 'sunday';

    // This works by shifting the weekday back by one day if we
    // are treating Monday as the first day of the week.
    var wday = d.getDay();
    if (firstWeekday == 'monday') {
      if (wday == 0) // Sunday
        wday = 6;
      else
        wday--;
    }
    var firstDayOfYear = new Date(d.getFullYear(), 0, 1)
      , yday = (d - firstDayOfYear) / 86400000
      , weekNum = (yday + 7 - wday) / 7
      ;
    return Math.floor(weekNum);
  }

}());

},{}],9:[function(_dereq_,module,exports){
var ActionBlock, Promise, RemoteTemplate, StateMachine, def, dom, humps, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

humps = _dereq_("humps");

dom = _dereq_("./dom");

util = _dereq_("./util");

def = util.def, StateMachine = util.StateMachine, Promise = util.Promise;

RemoteTemplate = _dereq_("./templates/remote_template");

ActionBlock = (function() {
  ActionBlock.StateMachine = (function(_super) {
    __extends(StateMachine, _super);

    function StateMachine() {
      return StateMachine.__super__.constructor.apply(this, arguments);
    }

    StateMachine.prototype.transitions = {
      loading: {
        "loaded": "loaded",
        "error": "error"
      }
    };

    StateMachine.prototype.load = function(promise) {
      var onFailure, onSuccess;
      onSuccess = (function(_this) {
        return function() {
          return _this.transitionTo("loaded");
        };
      })(this);
      onFailure = (function(_this) {
        return function() {
          return _this.transitionTo("error");
        };
      })(this);
      return promise.then(onSuccess, onFailure);
    };

    return StateMachine;

  })(StateMachine);

  ActionBlock.selector = "[data-prps-action-block]";

  ActionBlock.attachAll = function(purpose, root) {
    var attachElement, element, list, mapping, _i, _len, _ref;
    list = [];
    mapping = util.create(list);
    attachElement = (function(_this) {
      return function(element) {
        var block, id, klass, type;
        type = dom.options(element).actionBlock;
        klass = _this.types[type] || (function() {
          throw new Error("Unknown ActionBlock '" + type + "'");
        })();
        block = new klass(purpose, element);
        list.push(block);
        if (id = block.id()) {
          return mapping[id] = block;
        }
      };
    })(this);
    if (dom.matches(root, this.selector)) {
      attachElement(root);
    }
    _ref = root.querySelectorAll(this.selector);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      attachElement(element);
    }
    return mapping;
  };

  ActionBlock.templating = true;

  function ActionBlock(purpose, element) {
    this.purpose = purpose;
    this.element = element;
    this.loaded || (this.loaded = this.constructor.templating ? (this._template = new RemoteTemplate(this.purpose), this._template.safe = false, this._template.attach(this.element).then((function(_this) {
      return function() {
        return _this;
      };
    })(this))) : Promise.resolve(this));
    this.stateMachine().load(this.loaded);
  }

  ActionBlock.prototype.loaded = void 0;

  ActionBlock.prototype.purpose = void 0;

  ActionBlock.prototype.element = void 0;

  ActionBlock.prototype.generator = void 0;

  ActionBlock.prototype.initalState = "loading";

  def(ActionBlock.prototype, "id", {
    get: function() {
      return humps.camelize(this.element.id);
    }
  });

  def(ActionBlock.prototype, "options", {
    get: function() {
      return dom.options(this.element);
    }
  });

  def(ActionBlock.prototype, "movement", {
    get: function() {
      return this.purpose.movement(this.element);
    }
  });

  def(ActionBlock.prototype, "action", {
    get: function() {
      return this.purpose.action(this.element);
    }
  });

  def(ActionBlock.prototype, "stateMachine", {
    get: function() {
      return this._stateMachine || (this._stateMachine = new this.constructor.StateMachine(this.initalState, (function(_this) {
        return function(from, to) {
          return _this._reflectState(from, to);
        };
      })(this)));
    }
  });

  ActionBlock.prototype._reflectState = function(from, to) {
    if (from) {
      dom.toggleClass(this.element, "prps-state-" + from, false);
    }
    return dom.toggleClass(this.element, "prps-state-" + to, true);
  };

  return ActionBlock;

})();

module.exports = ActionBlock;

module.exports.ActionBlock = ActionBlock;

ActionBlock.types = {
  wizard: _dereq_("./action_blocks/wizard"),
  feed: _dereq_("./action_blocks/feed"),
  "read-more": _dereq_("./action_blocks/read_more"),
  template: _dereq_("./action_blocks/template"),
  progress: _dereq_("./action_blocks/progress")
};

},{"./action_blocks/feed":10,"./action_blocks/progress":11,"./action_blocks/read_more":12,"./action_blocks/template":13,"./action_blocks/wizard":14,"./dom":17,"./templates/remote_template":46,"./util":47,"humps":6}],10:[function(_dereq_,module,exports){
var ActionBlock, Feed, LocalTemplate, Promise, console, dom, parseNumber, timers, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LocalTemplate = _dereq_("../templates/local_template");

ActionBlock = _dereq_("../action_block");

dom = _dereq_("../dom");

_ref = _dereq_("../util"), parseNumber = _ref.parseNumber, timers = _ref.timers, Promise = _ref.Promise, console = _ref.console;

Feed = (function(_super) {
  __extends(Feed, _super);

  Feed.StateMachine = (function(_super1) {
    __extends(StateMachine, _super1);

    function StateMachine() {
      return StateMachine.__super__.constructor.apply(this, arguments);
    }

    return StateMachine;

  })(ActionBlock.StateMachine);

  Feed.templating = false;

  function Feed(purpose, element) {
    var interval;
    this.purpose = purpose;
    this.element = element;
    this.interval = parseNumber(this.options().feedRenderInterval, 4);
    this.size = parseNumber(this.options().feedSize, 5);
    this.templateElement = this.element.querySelector("[data-prps-feed-template]");
    if (!this.templateElement) {
      throw new Error("Feed '" + (this.id()) + "' is missing feed template.");
    }
    this.templateElement.parentNode.removeChild(this.templateElement);
    this.templateElement.removeAttribute("data-prps-feed-template");
    interval = parseNumber(this.options().feedPollInterval, null);
    this.feed = this.action().feed(this.options().feedName, {
      interval: interval
    });
    this.loaded = new Promise((function(_this) {
      return function(resolve, reject) {
        var callback;
        callback = function(events) {
          resolve(_this);
          return _this._incoming(events);
        };
        return _this.feed.start(callback).then(null, function(error) {
          console.error("[ActionBlock.Feed]", error);
          reject(error);
          throw error;
        });
      };
    })(this));
    this.queue = void 0;
    this.timer = void 0;
    Feed.__super__.constructor.apply(this, arguments);
  }

  Feed.prototype.loaded = void 0;

  Feed.prototype.feed = void 0;

  Feed.prototype.stop = function() {
    return this.feed.stop();
  };

  Feed.prototype._incoming = function(events) {
    var size;
    if (!this.queue) {
      size = this.size;
    }
    this.queue = (this.queue || []).concat(events);
    return this.timer || this._render(size);
  };

  Feed.prototype._render = function(size) {
    var child, event, index, item, removables, template, _i, _j, _len, _len1, _ref1;
    if (size == null) {
      size = 1;
    }
    _ref1 = this.queue.splice(0, size);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      event = _ref1[_i];
      item = this.templateElement.cloneNode(true);
      template = new LocalTemplate(this.purpose, event);
      template.attach(item);
      this.element.insertBefore(item, this.element.firstChild);
    }
    removables = (function() {
      var _j, _len1, _ref2, _results;
      _ref2 = this.element.children;
      _results = [];
      for (index = _j = 0, _len1 = _ref2.length; _j < _len1; index = ++_j) {
        child = _ref2[index];
        if (index >= this.size) {
          _results.push(child);
        }
      }
      return _results;
    }).call(this);
    for (_j = 0, _len1 = removables.length; _j < _len1; _j++) {
      child = removables[_j];
      this.element.removeChild(child);
    }
    return this.timer = this.queue.length ? timers.setTimeout(((function(_this) {
      return function() {
        return _this._render();
      };
    })(this)), this.interval * 1000) : void 0;
  };

  return Feed;

})(ActionBlock);

module.exports = Feed;

},{"../action_block":9,"../dom":17,"../templates/local_template":45,"../util":47}],11:[function(_dereq_,module,exports){
var ActionBlock, ActionCounts, LocalTemplate, Progress, def,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ActionBlock = _dereq_("../action_block");

ActionCounts = _dereq_("../resources/action_counts");

LocalTemplate = _dereq_("../templates/local_template");

def = _dereq_("../util").def;

Progress = (function(_super) {
  __extends(Progress, _super);

  Progress.StateMachine = (function(_super1) {
    __extends(StateMachine, _super1);

    function StateMachine() {
      return StateMachine.__super__.constructor.apply(this, arguments);
    }

    return StateMachine;

  })(ActionBlock.StateMachine);

  function Progress(purpose, element) {
    this.purpose = purpose;
    this.element = element;
    Progress.__super__.constructor.apply(this, arguments);
    this._template.processor("calculate", {
      preprocess: function(data) {
        data.goal = data.signaturesGoal;
        return data.percent = (Math.min(data.signatures / data.goal, 1.0) * 100).toFixed(2);
      }
    });
  }

  return Progress;

})(ActionBlock);

module.exports = Progress;

},{"../action_block":9,"../resources/action_counts":40,"../templates/local_template":45,"../util":47}],12:[function(_dereq_,module,exports){
var ActionBlock, ReadMore, dom,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ActionBlock = _dereq_("../action_block");

dom = _dereq_("../dom");

ReadMore = (function(_super) {
  __extends(ReadMore, _super);

  ReadMore.StateMachine = (function(_super1) {
    __extends(StateMachine, _super1);

    function StateMachine() {
      return StateMachine.__super__.constructor.apply(this, arguments);
    }

    return StateMachine;

  })(ActionBlock.StateMachine);

  ReadMore.prototype.HIDDEN_DOM_CLASS = "prps-hidden";

  function ReadMore(purpose, element) {
    var targetId;
    this.purpose = purpose;
    this.element = element;
    ReadMore.__super__.constructor.apply(this, arguments);
    targetId = this.options()["for"];
    this.targetElement = document.getElementById(targetId);
    if (!this.targetElement) {
      throw new Error("Unable to find #" + targetId);
    }
    dom.toggleClass(this.targetElement, this.HIDDEN_DOM_CLASS, true);
    dom.addEventListener(this.element, "click", (function(_this) {
      return function(event) {
        dom.preventDefault(event);
        return _this.toggle();
      };
    })(this));
  }

  ReadMore.prototype.toggle = function() {
    return dom.toggleClass(this.targetElement, this.HIDDEN_DOM_CLASS);
  };

  return ReadMore;

})(ActionBlock);

module.exports = ReadMore;

},{"../action_block":9,"../dom":17}],13:[function(_dereq_,module,exports){
var ActionBlock, Template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ActionBlock = _dereq_("../action_block");

Template = (function(_super) {
  __extends(Template, _super);

  function Template() {
    return Template.__super__.constructor.apply(this, arguments);
  }

  Template.StateMachine = (function(_super1) {
    __extends(StateMachine, _super1);

    function StateMachine() {
      return StateMachine.__super__.constructor.apply(this, arguments);
    }

    return StateMachine;

  })(ActionBlock.StateMachine);

  return Template;

})(ActionBlock);

module.exports = Template;

},{"../action_block":9}],14:[function(_dereq_,module,exports){
var ActionBlock, StateMachine, Wizard, def, dom, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

util = _dereq_("../util");

def = util.def, StateMachine = util.StateMachine;

dom = _dereq_("../dom");

ActionBlock = _dereq_("../action_block");

Wizard = (function(_super) {
  __extends(Wizard, _super);

  Wizard.Step = _dereq_("./wizard/step");

  Wizard.StateMachine = (function(_super1) {
    __extends(StateMachine, _super1);

    StateMachine.prototype.transitions = {
      loading: {
        loaded: {
          "consensus": "consensus"
        },
        error: {}
      },
      loaded: {
        validating: {},
        sending: {}
      },
      error: {},
      validating: {
        valid: {
          "consensus": "consensus",
          "fallback": "fallback"
        },
        invalid: {},
        fallbacks: ["validating", "invalid", "loaded", "valid"]
      },
      valid: {
        sending: {}
      },
      invalid: {
        validating: {}
      },
      sending: {
        completed: {
          "consensus": "consensus",
          "fallback": "fallback"
        },
        failed: {},
        fallbacks: ["sending", "validating", "failed", "invalid", "loaded", "valid"]
      },
      completed: {},
      failed: {
        validating: {}
      }
    };

    function StateMachine(current, steps, onTransition) {
      this.current = current;
      this.steps = steps;
      this.onTransition = onTransition;
      this.onTransition(null, this.current);
    }

    StateMachine.prototype.load = function(promise) {};

    StateMachine.prototype.transitionTo = function(to) {
      var state, stateMatcher, step, _i, _len, _ref;
      if (this.steps && this.canTransitionTo(to)) {
        stateMatcher = function(step) {
          return step.stateMachine().current === to;
        };
        if (this.transitions[this.current][to].consensus) {
          if (util.every(this.steps, stateMatcher)) {
            return this._setState(to);
          } else if (this.transitions[this.current][to].fallback) {
            this.stepStates = (function() {
              var _i, _len, _ref, _results;
              _ref = this.steps;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                step = _ref[_i];
                _results.push(step.stateMachine().current);
              }
              return _results;
            }).call(this);
            _ref = this.transitions[this.current].fallbacks;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              state = _ref[_i];
              if (__indexOf.call(this.stepStates, state) >= 0) {
                this._setState(state);
                return;
              }
            }
          }
        } else {
          if (util.some(this.steps, stateMatcher)) {
            return this._setState(to);
          }
        }
      }
    };

    StateMachine.prototype._setState = function(to) {
      var from;
      from = this.current;
      this.current = to;
      return this.onTransition(from, to);
    };

    return StateMachine;

  })(ActionBlock.StateMachine);

  function Wizard(purpose, element) {
    var child, _i, _len, _ref;
    this.purpose = purpose;
    this.element = element;
    if (!(this.element.children.length >= 2)) {
      throw new Error("There must be at least 2 steps in a Wizard!");
    }
    this.steps = [];
    Wizard.__super__.constructor.apply(this, arguments);
    _ref = this.element.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      this.steps.push(new Wizard.Step(this, child));
    }
    this.current(this.steps[0]);
  }

  Wizard.prototype.next = function() {
    var next;
    next = this.steps[util.indexOf(this.steps, this.current()) + 1];
    if (!next) {
      throw new Error("Wizard cannot advance beyond final step.");
    }
    return this.current(next);
  };

  def(Wizard.prototype, "data", {
    get: function() {
      return this._data != null ? this._data : this._data = {};
    },
    set: function(data) {
      return util.assign(this._data, data);
    }
  });

  def(Wizard.prototype, "current", {
    get: function() {
      return this._current;
    },
    set: function(step) {
      if (__indexOf.call(this.steps, step) < 0) {
        throw new Error("Given step is not amongst available steps!");
      }
      step.data(this.data());
      if (this._current != null) {
        dom.toggleClass(this._current.element, "prps-current-step", false);
      }
      this._current = step;
      return dom.toggleClass(this._current.element, "prps-current-step", true);
    }
  });

  def(Wizard.prototype, "stateMachine", {
    get: function() {
      return this._stateMachine || (this._stateMachine = new Wizard.StateMachine(this.initalState, this.steps, (function(_this) {
        return function(from, to) {
          return _this._reflectState(from, to);
        };
      })(this)));
    }
  });

  return Wizard;

})(ActionBlock);

module.exports = Wizard;

},{"../action_block":9,"../dom":17,"../util":47,"./wizard/step":15}],15:[function(_dereq_,module,exports){
var ActionBlock, StateMachine, Step, def, dom, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

dom = _dereq_("../../dom");

util = _dereq_("../../util");

ActionBlock = _dereq_("../../action_block").ActionBlock;

def = util.def, StateMachine = util.StateMachine;

Step = (function() {
  Step.StateMachine = (function(_super) {
    __extends(StateMachine, _super);

    function StateMachine() {
      return StateMachine.__super__.constructor.apply(this, arguments);
    }

    StateMachine.prototype.transitions = {
      loading: {
        "loaded": "loaded",
        "error": "error"
      },
      loaded: {
        "validating": "validating"
      },
      validating: {
        "valid": "valid",
        "invalid": "invalid"
      },
      invalid: {
        "validating": "validating"
      },
      valid: {
        "sending": "sending"
      },
      sending: {
        "completed": "completed",
        "failed": "failed"
      },
      failed: {
        "validating": "validating"
      },
      completed: {}
    };

    StateMachine.prototype.validate = function(validator) {
      return this.transitionTo("validating", function() {
        if (validator()) {
          this.transitionTo("valid");
          return true;
        } else {
          this.transitionTo("invalid");
          return false;
        }
      });
    };

    StateMachine.prototype.submit = function(submitter) {
      var onFailure, onSuccess, promise;
      if (promise = this.transitionTo("sending", submitter)) {
        onSuccess = (function(_this) {
          return function(value) {
            return _this.transitionTo("completed");
          };
        })(this);
        onFailure = (function(_this) {
          return function(error) {
            return _this.transitionTo("failed");
          };
        })(this);
        promise.then(onSuccess, onFailure);
        return promise;
      } else {
        return false;
      }
    };

    return StateMachine;

  })(ActionBlock.StateMachine);

  function Step(wizard, element) {
    var matches;
    this.wizard = wizard;
    this.element = element;
    this._validator = __bind(this._validator, this);
    matches = this.element.querySelectorAll("form");
    if (matches.length > 1) {
      throw new Error("Steps can't contain more than one form element.");
    } else if (this._form = matches[0]) {
      this._form.setAttribute("novalidate", true);
      dom.addEventListener(this._form, "submit", (function(_this) {
        return function(event) {
          dom.preventDefault(event);
          return _this.submit();
        };
      })(this));
    }
    this.stateMachine().load(this.wizard.loaded);
  }

  def(Step.prototype, "data", {
    get: function() {
      if (this._form) {
        return dom.formData(this._form);
      }
    },
    set: function(data) {
      if (this._form) {
        return dom.formData(this._form, util.assign({}, data, this.data()));
      }
    }
  });

  def(Step.prototype, "current", {
    get: function() {
      return this.wizard.current() === this;
    }
  });

  def(Step.prototype, "action", {
    get: function() {
      return this.wizard.purpose.action(this.element);
    }
  });

  def(Step.prototype, "stateMachine", {
    get: function() {
      return this._stateMachine || (this._stateMachine = new Step.StateMachine(this.wizard.initalState, (function(_this) {
        return function(from, to) {
          _this.wizard.stateMachine().transitionTo(to);
          return _this.wizard._reflectState.apply(_this, [from, to]);
        };
      })(this)));
    }
  });

  Step.prototype.submit = function() {
    if (this.stateMachine().validate(this._validator)) {
      return this.stateMachine().submit((function(_this) {
        return function() {
          var data;
          data = _this.data();
          return _this.action().takeAction({
            memberInfo: data
          }).then(function() {
            _this.wizard.data(data);
            return _this.wizard.next();
          });
        };
      })(this));
    } else {
      return false;
    }
  };

  Step.prototype._validator = function() {
    var formValid, input, inputValid, label, setValidity, _i, _j, _len, _len1, _ref, _ref1;
    setValidity = function(element, valid) {
      return dom.toggleClass(element, "prps-invalid", !valid);
    };
    formValid = true;
    _ref = this._form.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      input = _ref[_i];
      inputValid = dom.checkValidity(input);
      setValidity(input, inputValid);
      _ref1 = dom.labels(input);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        label = _ref1[_j];
        setValidity(label, inputValid);
      }
      formValid && (formValid = inputValid);
    }
    setValidity(this._form, formValid);
    return formValid;
  };

  return Step;

})();

module.exports = Step;

},{"../../action_block":9,"../../dom":17,"../../util":47}],16:[function(_dereq_,module,exports){
var Ajax, Promise, XMLHttpRequest, def, dom, humps, responseObjectAliases, util,
  __hasProp = {}.hasOwnProperty;

XMLHttpRequest = (typeof window !== "undefined" && window !== null ? window.XMLHttpRequest : void 0) || _dereq_("xhr2");

humps = _dereq_("humps");

util = _dereq_("./util");

def = util.def, Promise = util.Promise;

dom = _dereq_("./dom");

responseObjectAliases = {
  text: "responseText",
  "status": "status"
};

Ajax = (function() {
  function Ajax(options) {
    this.options = options != null ? options : {};
  }

  Ajax.prototype.options = {};

  Ajax.prototype.request = function(method, url, data, headers) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var error, eventName, key, params, request, response, value, _fn, _i, _len, _ref, _ref1;
        request = new XMLHttpRequest();
        if (window.XDomainRequest && !("withCredentials" in request)) {
          request = new XDomainRequest();
        }
        response = util.create({
          xhr: request
        });
        def(response, "json", {
          get: function() {
            var json;
            json = JSON.parse(this.text);
            if (json != null) {
              return humps.camelizeKeys(json);
            } else {
              throw new Error("JSON parse failed with " + json);
            }
          }
        });
        _ref = ["abort", "error", "timeout"];
        _fn = function(eventName) {
          return request["on" + eventName] = function(event) {
            event || (event = {
              type: eventName,
              message: "AJAX failure: " + eventName,
              target: request
            });
            return reject(event);
          };
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          eventName = _ref[_i];
          _fn(eventName);
        }
        request.onload = function(event) {
          var alias, original, _ref1;
          for (alias in responseObjectAliases) {
            if (!__hasProp.call(responseObjectAliases, alias)) continue;
            original = responseObjectAliases[alias];
            response[alias] = request[original];
          }
          if (response.status == null) {
            response.status = void 0;
          }
          response.success = response.status === void 0 || ((200 <= (_ref1 = response.status) && _ref1 < 300));
          response.failure = !response.success;
          return resolve(response);
        };
        _ref1 = _this.options;
        for (key in _ref1) {
          if (!__hasProp.call(_ref1, key)) continue;
          value = _ref1[key];
          if (key === "headers") {
            continue;
          }
          request[key] = value;
        }
        headers = util.assign({}, _this.options.headers, headers);
        data = humps.decamelizeKeys(data);
        if (method === "GET") {
          params = data;
          data = null;
        } else if (util.typeOf(data) === "[object Object]") {
          headers["Content-Type"] || (headers["Content-Type"] = "application/json;encoding=utf-8");
          data = JSON.stringify(data);
        }
        if (!request.setRequestHeader) {
          params = util.assign({
            xdomainrequest: headers
          }, params);
          headers = {};
        }
        url += _this.encodeQueryString(params);
        try {
          request.open(method, url);
          for (key in headers) {
            if (!__hasProp.call(headers, key)) continue;
            value = headers[key];
            request.setRequestHeader(key, value);
          }
          if (typeof _this.onbeforesend === "function") {
            _this.onbeforesend(request);
          }
          request.send(data != null ? data : null);
          return typeof _this.onaftersend === "function" ? _this.onaftersend(request) : void 0;
        } catch (_error) {
          error = _error;
          return reject({
            type: "failure",
            message: "AJAX failure: " + error.message,
            target: request
          });
        }
      };
    })(this));
  };

  Ajax.prototype.get = function(url, data, headers) {
    return this.request("GET", url, data, headers);
  };

  Ajax.prototype.post = function(url, data, headers) {
    return this.request("POST", url, data, headers);
  };

  Ajax.prototype.put = function(url, data, headers) {
    return this.request("PUT", url, data, headers);
  };

  Ajax.prototype["delete"] = function(url, headers) {
    return this.request("DELETE", url, {}, headers);
  };

  Ajax.prototype.patch = function(url, data, headers) {
    return this.request("PATCH", url, data, headers);
  };

  Ajax.prototype.encodeQueryString = function(object) {
    var item, k, key, param, params, v, value, _i, _len;
    if (object) {
      params = [];
      param = (function(_this) {
        return function(key, value) {
          if (value != null) {
            return params.push(_this.encode(key, value));
          }
        };
      })(this);
      for (key in object) {
        if (!__hasProp.call(object, key)) continue;
        value = object[key];
        switch (util.typeOf(value)) {
          case "[object Array]":
            for (_i = 0, _len = value.length; _i < _len; _i++) {
              item = value[_i];
              param("" + key + "[]", item);
            }
            break;
          case "[object Object]":
            for (k in value) {
              if (!__hasProp.call(value, k)) continue;
              v = value[k];
              param("" + key + "[" + k + "]", v);
            }
            break;
          default:
            param(key, value);
        }
      }
      return "?" + params.join("&");
    } else {
      return "";
    }
  };

  Ajax.prototype.encode = function(key, value) {
    return "" + (encodeURIComponent(key)) + "=" + (encodeURIComponent(value));
  };

  return Ajax;

})();

module.exports = Ajax;

},{"./dom":17,"./util":47,"humps":6,"xhr2":1}],17:[function(_dereq_,module,exports){
exports.labels = _dereq_("./dom/labels");

exports.options = _dereq_("./dom/options");

exports.checkValidity = _dereq_("./dom/check_validity");

exports.closest = _dereq_("./dom/closest");

exports.matches = _dereq_("./dom/matches");

exports.formData = _dereq_("./dom/form_data");

exports.ready = _dereq_("./dom/ready");

exports.toggleClass = _dereq_("./dom/toggle_class");

exports.addEventListener = _dereq_("./dom/add_event_listener");

exports.removeEventListener = _dereq_("./dom/add_event_listener");

exports.preventDefault = _dereq_("./dom/prevent_default");

exports.isIE8 = _dereq_("./dom/is_ie8");

},{"./dom/add_event_listener":18,"./dom/check_validity":19,"./dom/closest":20,"./dom/form_data":21,"./dom/is_ie8":22,"./dom/labels":23,"./dom/matches":24,"./dom/options":25,"./dom/prevent_default":26,"./dom/ready":27,"./dom/toggle_class":28}],18:[function(_dereq_,module,exports){
module.exports = function(target, eventType, listener) {
  if (target.addEventListener) {
    return target.addEventListener(eventType, listener, false);
  } else {
    return target.attachEvent("on" + eventType, listener);
  }
};

},{}],19:[function(_dereq_,module,exports){
var parseNumber, util, validators,
  __hasProp = {}.hasOwnProperty;

util = _dereq_("../util");

parseNumber = function(value) {
  var float, number;
  number = Number(value);
  float = parseFloat(value);
  if (isNaN(number) || isNaN(float)) {
    return null;
  } else if (number !== float) {
    return null;
  } else {
    return number;
  }
};

validators = {
  email: {
    check: function(input) {
      return input.getAttribute("type") === "email";
    },
    validate: (function() {
      var regex;
      regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return function(input) {
        var value;
        value = util.trim(input.value.split("\n").join(""));
        return value === "" || regex.test(value);
      };
    })()
  },
  required: {
    check: function(input) {
      return input.hasAttribute("required");
    },
    validate: function(input) {
      return input.value !== "";
    }
  },
  number: {
    check: function(input) {
      return input.getAttribute("type") === "number";
    },
    validate: function(input) {
      var max, min, value;
      value = parseNumber(input.value);
      if (value == null) {
        return false;
      }
      if (value === Infinity) {
        return false;
      }
      if (value === -Infinity) {
        return false;
      }
      min = parseNumber(input.getAttribute("min"));
      if ((min != null) && value < min) {
        return false;
      }
      max = parseNumber(input.getAttribute("max"));
      if ((max != null) && value > max) {
        return false;
      }
      return true;
    }
  },
  pattern: {
    check: function(input) {
      return input.hasAttribute("pattern");
    },
    validate: function(input) {
      var pattern, regex, value;
      pattern = input.getAttribute("pattern");
      regex = new RegExp("^(?:" + pattern + ")$", "");
      value = input.value;
      return value === "" || regex.test(value);
    }
  }
};

module.exports = function(element) {
  var type, valid, validator;
  valid = true;
  for (type in validators) {
    if (!__hasProp.call(validators, type)) continue;
    validator = validators[type];
    if (validator.check(element)) {
      valid && (valid = validator.validate(element));
    }
  }
  return valid;
};

},{"../util":47}],20:[function(_dereq_,module,exports){
var dom;

dom = _dereq_("../dom");

module.exports = function(element, selector) {
  var _ref, _ref1;
  if (dom.matches(element, selector)) {
    return element;
  } else if (((_ref = element.parentNode) != null ? _ref.nodeType : void 0) === ((_ref1 = element.ELEMENT_NODE) != null ? _ref1 : 1)) {
    return dom.closest(element.parentNode, selector);
  }
};

},{"../dom":17}],21:[function(_dereq_,module,exports){
var __hasProp = {}.hasOwnProperty;

module.exports = function(form, update) {
  var element, input, key, object, value, _i, _len, _ref;
  if (update == null) {
    update = void 0;
  }
  if (update) {
    for (key in update) {
      if (!__hasProp.call(update, key)) continue;
      value = update[key];
      if (input = form.elements[key]) {
        input.defaultValue = value;
        input.value = value;
      }
    }
  }
  object = {};
  _ref = form.elements;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    element = _ref[_i];
    if (!element.name) {
      continue;
    }
    if (element.getAttribute("type") === "checkbox" && !element.checked) {
      continue;
    }
    if (element.disabled) {
      continue;
    }
    if (element.value || element.hasAttribute("value")) {
      object[element.name] = element.value;
    }
  }
  return object;
};

},{}],22:[function(_dereq_,module,exports){
module.exports = function() {
  return (typeof document !== "undefined" && document !== null ? document.documentMode : void 0) === 8;
};

},{}],23:[function(_dereq_,module,exports){
var dom;

dom = _dereq_("../dom");

module.exports = function(element) {
  var closest, label, labels, _i, _len, _ref;
  labels = [];
  if (element.id) {
    _ref = document.querySelectorAll("label[for='" + element.id + "']");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      label = _ref[_i];
      labels.push(label);
    }
  }
  if (closest = dom.closest(element, "label")) {
    labels.push(closest);
  }
  return labels;
};

},{"../dom":17}],24:[function(_dereq_,module,exports){
var matches,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

matches = function(element) {
  var fn, prefix, _i, _len, _ref;
  if (!(fn = element.matches)) {
    _ref = ["moz", "o", "ms", "webkit"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      prefix = _ref[_i];
      fn = element["" + prefix + "MatchesSelector"];
      if (fn) {
        break;
      }
    }
  }
  if (fn) {
    return fn.bind(element);
  } else {
    return function(selector) {
      return __indexOf.call(element.parentNode.querySelectorAll(selector), element) >= 0;
    };
  }
};

module.exports = function(element, selector) {
  return matches(element)(selector);
};

},{}],25:[function(_dereq_,module,exports){
var humps;

humps = _dereq_("humps");

module.exports = function(element) {
  var attribute, name, options, _i, _len, _ref;
  options = {};
  _ref = element.attributes;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    attribute = _ref[_i];
    if (!(attribute.name.match(/^data-prps-/i))) {
      continue;
    }
    name = humps.camelize(attribute.name.slice(10));
    options[name] = attribute.value;
  }
  return options;
};

},{"humps":6}],26:[function(_dereq_,module,exports){
module.exports = function(event) {
  if (event.preventDefault) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }
  return event;
};

},{}],27:[function(_dereq_,module,exports){
var Promise, dom;

Promise = _dereq_("../util").Promise;

dom = _dereq_("../dom");

module.exports = function(document) {
  return document._prpsReady || (document._prpsReady = new Promise((function(_this) {
    return function(resolve) {
      var tryResolve;
      tryResolve = function() {
        if (document.readyState !== "loading") {
          resolve();
          dom.removeEventListener(document, "readystatechange", tryResolve);
          return true;
        } else {
          return false;
        }
      };
      if (!tryResolve()) {
        return dom.addEventListener(document, "readystatechange", tryResolve);
      }
    };
  })(this)));
};

},{"../dom":17,"../util":47}],28:[function(_dereq_,module,exports){
var util;

util = _dereq_("../util");

module.exports = function(element, klass, add) {
  var classes, found, index;
  classes = element.className.split(/\s+/);
  index = util.indexOf(classes, klass);
  found = index !== -1;
  if (add != null) {
    if (add && found) {
      return;
    }
    if (!add && !found) {
      return;
    }
  }
  if (index === -1) {
    classes.push(klass);
  } else {
    classes.splice(index, 1);
  }
  return element.className = classes.join(" ");
};

},{"../util":47}],29:[function(_dereq_,module,exports){
var Generator, Promise, dom, humps, util;

humps = _dereq_("humps");

util = _dereq_("./util");

Promise = util.Promise;

dom = _dereq_("./dom");

Generator = (function() {
  function Generator() {}

  Generator.selector = "[data-prps-generator]";

  Generator.generateAll = function(purpose, root) {
    var attachElement, element, generators, _i, _len, _ref;
    generators = [];
    attachElement = (function(_this) {
      return function(element) {
        var generator, klass, type;
        type = dom.options(element).generator;
        klass = _this.types[type] || (function() {
          throw new Error("Unknown Generator '" + type + "'");
        })();
        generator = new klass(purpose, element);
        return generators.push(generator.loaded);
      };
    })(this);
    if (dom.matches(root, this.selector)) {
      attachElement(root);
    } else {
      _ref = root.querySelectorAll(this.selector);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        attachElement(element);
      }
    }
    return Promise.all(generators).then(function(generators) {
      var generator, list, mapping, _j, _len1;
      list = [];
      mapping = util.create(list);
      for (_j = 0, _len1 = generators.length; _j < _len1; _j++) {
        generator = generators[_j];
        list.push(generator.actionBlock);
        if (generator.element.id) {
          mapping[generator.element.id] = generator.actionBlock;
        }
      }
      return mapping;
    });
  };

  return Generator;

})();

module.exports = Generator;

Generator.types = {
  "action-sequence": _dereq_("./generators/action_sequence")
};

},{"./dom":17,"./generators/action_sequence":30,"./util":47,"humps":6}],30:[function(_dereq_,module,exports){
var ActionSequence, Generator, Modules, Promise, Wizard, def, dom, inputTypes, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Generator = _dereq_("../generator");

Wizard = _dereq_("../action_blocks/wizard");

dom = _dereq_("../dom");

_ref = _dereq_("../util"), def = _ref.def, Promise = _ref.Promise;

Modules = {};

Modules.TellAFriendModule = Modules.ContentShareModule = _dereq_("./templates/tell_a_friend");

Modules.PetitionModule = _dereq_("./templates/petition");

inputTypes = {
  country: "select",
  email: "email",
  homeNumber: "tel",
  mobileNumber: "tel"
};

ActionSequence = (function(_super) {
  __extends(ActionSequence, _super);

  function ActionSequence(purpose, element) {
    this.purpose = purpose;
    this.element = element;
    this.loaded = this.fetch().then((function(_this) {
      return function(actionSequence) {
        return Promise.all(actionSequence.actionBlocks()).then(function(actionBlocks) {
          var ol;
          ol = _this.render(actionSequence, actionBlocks);
          _this.element.appendChild(ol);
          _this.actionBlock = new Wizard(_this.purpose, ol);
          _this.actionBlock.generator = _this;
          return _this;
        });
      };
    })(this));
    this.loaded.done();
  }

  def(ActionSequence.prototype, "options", {
    get: function() {
      return dom.options(this.element);
    }
  });

  ActionSequence.prototype.render = function(actionSequence, actionBlocks) {
    var block, module, ol, _i, _len;
    ol = document.createElement("ol");
    ol.className = "prps-steplist";
    for (_i = 0, _len = actionBlocks.length; _i < _len; _i++) {
      block = actionBlocks[_i];
      block.inputTypes = inputTypes;
      module = Modules[block.type];
      if (!module) {
        throw new Error("module " + block.type + " is not supported");
      }
      ol.innerHTML += module(block);
    }
    return ol;
  };

  ActionSequence.prototype.fetch = function() {
    return this.purpose.movement(this.element).actionSequence(this.options().actionSequence);
  };

  return ActionSequence;

})(Generator);

module.exports = ActionSequence;

},{"../action_blocks/wizard":14,"../dom":17,"../generator":29,"../util":47,"./templates/petition":31,"./templates/tell_a_friend":32}],31:[function(_dereq_,module,exports){
module.exports = function(__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
      var country, field, iso, mode, _ref, _ref1,
        __hasProp = {}.hasOwnProperty;
    
      __out.push('<li data-prps-id="');
    
      __out.push(__sanitize(this.pageId));
    
      __out.push('">\n  <form>\n    ');
    
      if (this.imageUrl) {
        __out.push('\n      <div class="prps-media"><img src="');
        __out.push(__sanitize(this.imageUrl));
        __out.push('"></div>\n    ');
      }
    
      __out.push('\n    ');
    
      if (this.title) {
        __out.push('\n      <h1 class="prps-widget-title">');
        __out.push(__sanitize(this.title));
        __out.push('</h1>\n    ');
      }
    
      __out.push('\n    ');
    
      if (this.statement) {
        __out.push('\n      <div>');
        __out.push(this.statement);
        __out.push('</div>\n    ');
      }
    
      __out.push('\n    ');
    
      if (this.explanatoryHeadline) {
        __out.push('\n      <h2>');
        __out.push(__sanitize(this.explanatoryHeadline));
        __out.push('</h2>\n    ');
      }
    
      __out.push('\n    ');
    
      if (this.content) {
        __out.push('\n      <div>');
        __out.push(this.content);
        __out.push('</div>\n    ');
      }
    
      __out.push('\n\n    ');
    
      _ref = this.fields;
      for (field in _ref) {
        mode = _ref[field];
        if (!(mode !== "hidden")) {
          continue;
        }
        __out.push('\n      <label>\n        ');
        __out.push(__sanitize(this.i18n.fields[field]));
        __out.push('\n        ');
        if (field === "country") {
          __out.push('\n          <select ');
          if (mode === "required") {
            __out.push(__sanitize("required"));
          }
          __out.push(' name="');
          __out.push(__sanitize(field));
          __out.push('">\n            ');
          _ref1 = this.i18n.countries;
          for (iso in _ref1) {
            if (!__hasProp.call(_ref1, iso)) continue;
            country = _ref1[iso];
            __out.push('\n              <option value="');
            __out.push(__sanitize(iso));
            __out.push('">');
            __out.push(__sanitize(country));
            __out.push('</option>\n            ');
          }
          __out.push('\n          </select>\n        ');
        } else {
          __out.push('\n          <input ');
          if (mode === "required") {
            __out.push(__sanitize("required"));
          }
          __out.push(' type="');
          __out.push(__sanitize(this.inputTypes[field] || 'text'));
          __out.push('" name="');
          __out.push(__sanitize(field));
          __out.push('" class="prps-input">\n        ');
        }
        __out.push('\n\n        <p class="prps-invalid-message">\n          ');
        __out.push(__sanitize(this.i18n.validationErrors[field] || this.i18n.validationErrors.required));
        __out.push('\n        </p>\n      </label>\n    ');
      }
    
      __out.push('\n\n    ');
    
      if (this.disclaimer) {
        __out.push('\n      <small>');
        __out.push(this.disclaimer);
        __out.push('</small>\n    ');
      }
    
      __out.push('\n\n    <div class="prps-bottom">\n      <button class="prps-btn prps-btn--block">');
    
      __out.push(__sanitize(this.buttonText));
    
      __out.push('</button>\n      <p class="prps-failed-message">');
    
      __out.push(__sanitize(this.i18n.serverError));
    
      __out.push('</p>\n    </div>\n  </form>\n</li>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
},{}],32:[function(_dereq_,module,exports){
module.exports = function(__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
      __out.push('<li data-prps-id="');
    
      __out.push(__sanitize(this.pageId));
    
      __out.push('">\n  <div class="prps-top">\n    <h1 class="prps-widget-title">');
    
      __out.push(__sanitize(this.headline));
    
      __out.push('</h1>\n  </div>\n  <ul class="prps-share">\n    ');
    
      if (this.twitterEnabled) {
        __out.push('\n      <li>\n        <a href="');
        __out.push(__sanitize(this.twitterShareUrl));
        __out.push('">\n          <i class="prps-icon-twitter"></i>\n          ');
        __out.push(__sanitize(this.i18n.share.twitter));
        __out.push('\n        </a>\n      </li>\n    ');
      }
    
      __out.push('\n    ');
    
      if (this.facebookEnabled) {
        __out.push('\n      <li>\n        <a href="');
        __out.push(__sanitize(this.facebookShareUrl));
        __out.push('">\n          <i class="prps-icon-facebook"></i>\n          ');
        __out.push(__sanitize(this.i18n.share.facebook));
        __out.push('\n        </a>\n      </li>\n    ');
      }
    
      __out.push('\n    ');
    
      if (this.emailEnabled) {
        __out.push('\n      <li>\n        <a href="');
        __out.push(__sanitize(this.emailShareUrl));
        __out.push('">\n          <i class="prps-icon-email"></i>\n          ');
        __out.push(__sanitize(this.i18n.share.email));
        __out.push('\n        </a>\n      </li>\n    ');
      }
    
      __out.push('\n  </ul>\n</li>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}
},{}],33:[function(_dereq_,module,exports){
module.exports = {
  en: _dereq_("./i18n/en")
};

},{"./i18n/en":34}],34:[function(_dereq_,module,exports){
module.exports = {
  fields: {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    country: "Country",
    mobileNumber: "Mobile Phone",
    homeNumber: "Phone",
    streetAddress: "Street Address",
    postcode: "Post Code",
    division: "Suburb",
    identification: "Identification Code"
  },
  validationErrors: {
    email: "must be a valid email address",
    required: "is required"
  },
  share: {
    facebook: "Share on Facebook",
    twitter: "Share on Twitter",
    email: "Share via Email"
  },
  serverError: "Server error. Please try again.",
  countries: {
    af: "Afghanistan",
    al: "Albania",
    dz: "Algeria",
    as: "American Samoa",
    ad: "Andorra",
    ao: "Angola",
    ai: "Anguilla",
    ag: "Antigua and Barbuda",
    ar: "Argentina",
    am: "Armenia",
    aw: "Aruba",
    au: "Australia",
    at: "Austria",
    az: "Azerbaijan",
    bs: "Bahamas",
    bh: "Bahrain",
    bd: "Bangladesh",
    bb: "Barbados",
    by: "Belarus",
    be: "Belgium",
    bz: "Belize",
    bj: "Benin",
    bm: "Bermuda",
    bt: "Bhutan",
    bo: "Bolivia",
    ba: "Bosnia and Herzegovina",
    bw: "Botswana",
    br: "Brazil",
    bn: "Brunei Darussalam",
    bg: "Bulgaria",
    bf: "Burkina Faso",
    bi: "Burundi",
    kh: "Cambodia",
    cm: "Cameroon",
    ca: "Canada",
    cv: "Cape Verde",
    ky: "Cayman Islands",
    cf: "Central African Republic",
    td: "Chad",
    cl: "Chile",
    cn: "China",
    co: "Colombia",
    km: "Comoros",
    cg: "Congo",
    cd: "Congo, Democratic Republic of the",
    ck: "Cook Islands",
    cr: "Costa Rica",
    ci: "Cote d'Ivoire",
    hr: "Croatia",
    cu: "Cuba",
    cy: "Cyprus",
    cz: "Czech Republic",
    dk: "Denmark",
    dj: "Djibouti",
    dm: "Dominica",
    "do": "Dominican Republic",
    ec: "Ecuador",
    eg: "Egypt",
    sv: "El Salvador",
    gq: "Equatorial Guinea",
    er: "Eritrea",
    ee: "Estonia",
    et: "Ethiopia",
    fk: "Falkland Islands",
    fo: "Faroe Islands",
    fj: "Fiji",
    fi: "Finland",
    fr: "France",
    gf: "French Guiana",
    pf: "French Polynesia",
    ga: "Gabon",
    gm: "Gambia",
    ge: "Georgia",
    de: "Germany",
    gh: "Ghana",
    gi: "Gibraltar",
    gr: "Greece",
    gl: "Greenland",
    gd: "Grenada",
    gp: "Guadeloupe",
    gu: "Guam",
    gt: "Guatemala",
    gn: "Guinea",
    gw: "Guinea-Bissau",
    gy: "Guyana",
    ht: "Haiti",
    hn: "Honduras",
    hk: "Hong Kong",
    hu: "Hungary",
    is: "Iceland",
    "in": "India",
    id: "Indonesia",
    ir: "Iran",
    iq: "Iraq",
    ie: "Ireland",
    il: "Israel",
    it: "Italy",
    jm: "Jamaica",
    jp: "Japan",
    jo: "Jordan",
    kz: "Kazakhstan",
    ke: "Kenya",
    ki: "Kiribati",
    xk: "Kosovo",
    kw: "Kuwait",
    kg: "Kyrgyzstan",
    la: "Laos",
    lv: "Latvia",
    lb: "Lebanon",
    ls: "Lesotho",
    lr: "Liberia",
    ly: "Libya",
    li: "Liechtenstein",
    lt: "Lithuania",
    lu: "Luxembourg",
    mo: "Macao",
    mk: "Macedonia",
    mg: "Madagascar",
    mw: "Malawi",
    my: "Malaysia",
    mv: "Maldives",
    ml: "Mali",
    mt: "Malta",
    mh: "Marshall Islands",
    mq: "Martinique",
    mr: "Mauritania",
    mu: "Mauritius",
    yt: "Mayotte",
    mx: "Mexico",
    fm: "Micronesia",
    md: "Moldova",
    mc: "Monaco",
    mn: "Mongolia",
    me: "Montenegro",
    ms: "Montserrat",
    ma: "Morocco",
    mz: "Mozambique",
    mm: "Myanmar",
    na: "Namibia",
    nr: "Nauru",
    np: "Nepal",
    nl: "Netherlands",
    an: "Netherlands Antilles",
    nc: "New Caledonia",
    nz: "New Zealand",
    ni: "Nicaragua",
    ne: "Niger",
    ng: "Nigeria",
    nf: "Norfolk Island",
    mp: "Northern Mariana Islands",
    kp: "North Korea",
    'no': "Norway",
    om: "Oman",
    pk: "Pakistan",
    pw: "Palau",
    ps: "Palestinian Territory",
    pa: "Panama",
    pg: "Papua New Guinea",
    py: "Paraguay",
    pe: "Peru",
    ph: "Philippines",
    pl: "Poland",
    pt: "Portugal",
    pr: "Puerto Rico",
    qa: "Qatar",
    re: "Réunion",
    ro: "Romania",
    ru: "Russian Federation",
    rw: "Rwanda",
    sh: "Saint Helena",
    kn: "Saint Kitts and Nevis",
    lc: "Saint Lucia",
    pm: "Saint Pierre and Miquelon",
    vc: "Saint Vincent and the Grenadines",
    ws: "Samoa",
    sm: "San Marino",
    st: "Sao Tome and Principe",
    sa: "Saudi Arabia",
    sn: "Senegal",
    cs: "Serbia",
    sc: "Seychelles",
    sl: "Sierra Leone",
    sg: "Singapore",
    sk: "Slovakia",
    si: "Slovenia",
    sb: "Solomon Islands",
    so: "Somalia",
    za: "South Africa",
    kr: "South Korea",
    es: "Spain",
    lk: "Sri Lanka",
    sd: "Sudan",
    sr: "Suriname",
    sz: "Swaziland",
    se: "Sweden",
    ch: "Switzerland",
    sy: "Syrian Arab Republic",
    tw: "Taiwan",
    tj: "Tajikistan",
    tz: "Tanzania",
    th: "Thailand",
    tl: "Timor-Leste",
    tg: "Togo",
    tk: "Tokelau",
    to: "Tonga",
    tt: "Trinidad and Tobago",
    tn: "Tunisia",
    tr: "Turkey",
    tm: "Turkmenistan",
    tc: "Turks and Caicos Islands",
    tv: "Tuvalu",
    ug: "Uganda",
    ua: "Ukraine",
    ae: "United Arab Emirates",
    gb: "United Kingdom",
    us: "United States",
    um: "United States Minor Outlying Islands",
    uy: "Uruguay",
    uz: "Uzbekistan",
    vu: "Vanuatu",
    va: "Vatican City",
    ve: "Venezuela",
    vn: "Vietnam",
    vg: "Virgin Islands, British",
    vi: "Virgin Islands, U.S.",
    wf: "Wallis and Futuna",
    eh: "Western Sahara",
    ye: "Yemen",
    zm: "Zambia",
    zw: "Zimbabwe"
  }
};

},{}],35:[function(_dereq_,module,exports){
var ActionBlock, Ajax, Generator, Movement, Promise, Purpose, RemoteTemplate, Template, attachPromiseCallback, console, def, dom, i18n, util;

dom = _dereq_("./dom");

ActionBlock = _dereq_("./action_block");

Generator = _dereq_("./generator");

RemoteTemplate = _dereq_("./templates/remote_template");

Template = _dereq_("./template");

Ajax = _dereq_("./ajax");

i18n = _dereq_("./i18n");

Movement = _dereq_("./resources/movement");

util = _dereq_("./util");

def = util.def, attachPromiseCallback = util.attachPromiseCallback, Promise = util.Promise, console = util.console;

Purpose = (function() {
  Purpose.API_VERSION = "v1b";

  function Purpose(options) {
    var _ref;
    this.options = options != null ? options : {};
    _ref = this.options, this.url = _ref.url, this.baseFeedUrl = _ref.baseFeedUrl, this.apiKey = _ref.apiKey, this.locale = _ref.locale, this.shareUrl = _ref.shareUrl;
    this.locale || (this.locale = "en");
    this.i18n = i18n[this.locale];
    this.shareUrl || (this.shareUrl = this.location());
    this.purpose = this;
    if (!this.apiKey) {
      throw new Error("apiKey must be specified");
    }
    if (!this.url) {
      throw new Error("url must be specified");
    }
    this.ajax = {
      api: new Ajax({
        headers: {
          "API-VERSION": Purpose.API_VERSION,
          "API-KEY": this.apiKey
        }
      }),
      feed: new Ajax()
    };
  }

  Purpose.prototype.ajax = {};

  Purpose.prototype.account = "";

  Purpose.prototype.url = "";

  Purpose.prototype.baseFeedUrl = "";

  Purpose.prototype.purpose = void 0;

  Purpose.prototype.template = Template.prototype;

  Purpose.prototype.location = function() {
    return typeof window !== "undefined" && window !== null ? window.location.toString() : void 0;
  };

  Purpose.prototype.movement = function(id, callback) {
    var element, idElement, id , promise;
    if (typeof id !== "string") {
      element = id;
      if (idElement = dom.closest(element, "[data-prps-movement]")) {
        id  = dom.options(idElement).movement;
      } else {
        throw new Error("Found no movement id for " + (element.cloneNode(false).outerHTML));
      }
    }
    promise = new Movement.Promise(this, id);
    attachPromiseCallback(promise, callback);
    return promise;
  };

  Purpose.prototype.action = function(movement, id, callback) {
    var element, idElement, id , _ref;
    if (typeof movement !== "string") {
      _ref = [movement, id], element = _ref[0], callback = _ref[1];
      if (idElement = dom.closest(element, "[data-prps-id]")) {
        id  = dom.options(idElement).id ;
      } else {
        throw new Error("No Action id found in " + (element.cloneNode(false).outerHTML));
      }
    }
    return this.movement(movement).action(id, callback);
  };

  Purpose.prototype.attach = function(root) {
    var actionBlock, actionBlocks, actionBlocksLoaded, attempt, generators, generatorsLoaded, loaded, promise;
    if (root == null) {
      root = document;
    }
    promise = typeof root === "string" ? (attempt = (function(_this) {
      return function() {
        var element, matches;
        matches = document.querySelectorAll(root);
        if (matches.length > 1) {
          throw new Error("'" + root + "' must not match multiple elements. To attach multiple ActionBlocks supply a parent node's selector.");
        } else if (element = matches[0]) {
          return _this.attach(element);
        }
      };
    })(this), attempt() || dom.ready(document).then((function(_this) {
      return function() {
        return attempt() || (function() {
          throw new Error("Element '" + root + "' not found.");
        })();
      };
    })(this))) : root === document ? dom.ready(document).then((function(_this) {
      return function() {
        _this._tagIE();
        return _this.attach(document.body);
      };
    })(this)) : (actionBlocks = ActionBlock.attachAll(this, root), generators = Generator.generateAll(this, root), actionBlocksLoaded = Promise.all((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = actionBlocks.length; _i < _len; _i++) {
        actionBlock = actionBlocks[_i];
        _results.push(actionBlock.loaded);
      }
      return _results;
    })()), generatorsLoaded = generators.then(function(actionBlocks) {
      return Promise.all((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = actionBlocks.length; _i < _len; _i++) {
          actionBlock = actionBlocks[_i];
          _results.push(actionBlock.loaded);
        }
        return _results;
      })());
    }), loaded = Promise.all([actionBlocksLoaded, generatorsLoaded]), Promise.resolve({
      actionBlocks: actionBlocks,
      loaded: loaded,
      generators: generators
    }));
    promise.then(null, function(error) {
      return console.error(error);
    });
    return promise;
  };

  Purpose.prototype._tagIE = function() {
    var element, _i, _len, _ref, _results;
    if (dom.isIE8()) {
      _ref = document.querySelectorAll(".prps");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        _results.push(dom.toggleClass(element, "prps-ie8", true));
      }
      return _results;
    }
  };

  Purpose.Generators = {
    Generator: _dereq_("./generator"),
    ActionSequence: _dereq_("./generators/action_sequence")
  };

  Purpose.ActionBlocks = {
    ActionBlock: _dereq_("./action_block"),
    Wizard: _dereq_("./action_blocks/wizard"),
    Feed: _dereq_("./action_blocks/feed"),
    Template: _dereq_("./action_blocks/template"),
    ReadMore: _dereq_("./action_blocks/read_more"),
    Progress: _dereq_("./action_blocks/progress")
  };

  Purpose.Resources = {
    Resource: _dereq_("./resource"),
    ActionBlock: _dereq_("./resources/action_block"),
    ActionCounts: _dereq_("./resources/action_counts"),
    Action: _dereq_("./resources/action"),
    Feed: _dereq_("./resources/feed"),
    Movement: _dereq_("./resources/movement")
  };

  Purpose.Utils = {
    Template: _dereq_("./template"),
    LocalTemplate: _dereq_("./templates/local_template"),
    RemoteTemplate: _dereq_("./templates/remote_template"),
    I18n: _dereq_("./i18n")
  };

  return Purpose;

})();

module.exports = Purpose;

},{"./action_block":9,"./action_blocks/feed":10,"./action_blocks/progress":11,"./action_blocks/read_more":12,"./action_blocks/template":13,"./action_blocks/wizard":14,"./ajax":16,"./dom":17,"./generator":29,"./generators/action_sequence":30,"./i18n":33,"./resource":37,"./resources/action":38,"./resources/action_block":39,"./resources/action_counts":40,"./resources/feed":42,"./resources/movement":43,"./template":44,"./templates/local_template":45,"./templates/remote_template":46,"./util":47}],36:[function(_dereq_,module,exports){
var QueryPromise, def;

def = _dereq_("./util").def;

QueryPromise = (function() {
  QueryPromise.implement = function(method) {
    var model;
    model = this.prototype.model;
    return this.prototype[method] = function() {
      return model.prototype[method].apply(this, arguments);
    };
  };

  function QueryPromise(parent, id) {
    var url;
    this.parent = parent;
    this.id = id;
    this.resource = this;
    this.purpose = this.parent.purpose;
    url = [this.parent.url, this.scope];
    if (this.id) {
      url.push(this.id);
    }
    this.url = url.join("/");
    this.baseFeedUrl = [this.parent.baseFeedUrl, this.id].join("/");
  }

  QueryPromise.prototype.run = function() {
    return this.purpose.ajax.api.get(this.url);
  };

  QueryPromise.prototype.then = function(onResolve, onReject) {
    this._promise || (this._promise = this.run().then((function(_this) {
      return function(res) {
        if (res.success) {
          return new _this.model(_this, res.json());
        } else {
          throw new Error("unable to fetch " + _this.id + " from " + _this.url);
        }
      };
    })(this)));
    return this._promise.then(onResolve, onReject);
  };

  QueryPromise.prototype.url = void 0;

  QueryPromise.prototype.baseFeedUrl = void 0;

  QueryPromise.prototype.purpose = void 0;

  return QueryPromise;

})();

module.exports = QueryPromise;

},{"./util":47}],37:[function(_dereq_,module,exports){
var Resource, def, util;

util = _dereq_("./util");

def = util.def;

Resource = (function() {
  function Resource(resource, attributes) {
    var _ref;
    this.resource = resource;
    this.attributes = attributes;
    util.assign(this.attributes, this.attributes.options);
    util.assign(this, this.attributes);
    _ref = this.resource, this.purpose = _ref.purpose, this.id = _ref.id, this.url = _ref.url, this.baseFeedUrl = _ref.baseFeedUrl;
    this.i18n = this.purpose.i18n;
  }

  Resource.prototype.purpose = void 0;

  Resource.prototype.url = void 0;

  Resource.prototype.baseFeedUrl = void 0;

  Resource.prototype.i18n = void 0;

  return Resource;

})();

module.exports = Resource;

},{"./util":47}],38:[function(_dereq_,module,exports){
var Action, ActionBlock, ActionCounts, Feed, Promise, QueryPromise, Resource, attachPromiseCallback, def, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

QueryPromise = _dereq_("../query_promise");

Resource = _dereq_("../resource");

Feed = _dereq_("./feed");

ActionBlock = _dereq_("./action_block");

ActionCounts = _dereq_("./action_counts");

util = _dereq_("../util");

attachPromiseCallback = util.attachPromiseCallback, def = util.def, Promise = util.Promise;

Action = (function(_super) {
  __extends(Action, _super);

  function Action() {
    return Action.__super__.constructor.apply(this, arguments);
  }

  Action.Promise = (function(_super1) {
    __extends(Promise, _super1);

    function Promise() {
      return Promise.__super__.constructor.apply(this, arguments);
    }

    Promise.prototype.model = Action;

    Promise.prototype.scope = "action_pages";

    Promise.implement("takeAction");

    Promise.implement("feed");

    Promise.implement("actionBlock");

    Promise.implement("actionCounts");

    return Promise;

  })(QueryPromise);

  Action.formModuleNames = {
    "PetitionModule": "PetitionModule",
    "TellAFriendModule": "TellAFriendModule"
  };

  Action.attributesMapping = {
    firstName: "memberInfo[firstName]",
    lastName: "memberInfo[lastName]",
    email: "memberInfo[email]",
    countryIso: "memberInfo[countryIso]",
    postcode: "memberInfo[postcode]",
    mobileNumber: "memberInfo[mobileNumber]",
    homeNumber: "memberInfo[homeNumber]",
    suburb: "memberInfo[suburb]",
    streetAddress: "memberInfo[streetAddress]",
    ipAddress: "memberInfo[ipAddress]",
    refererUrl: "memberInfo[refererUrl]",
    comment: "actionInfo[comment]",
    t: "actionInfo[t]",
    currency: "actionInfo[currency]",
    amount: "actionInfo[amount]",
    paymentMethod: "actionInfo[paymentMethod]",
    confirmed: "actionInfo[confirmed]",
    frequency: "actionInfo[frequency]",
    orderId: "actionInfo[orderId]",
    transactionId: "actionInfo[transactionId]",
    subscriptionId: "actionInfo[subscriptionId]",
    subscriptionAmount: "actionInfo[subscriptionAmount]",
    ccMe: "actionInfo[ccMe]",
    subject: "actionInfo[subject]",
    body: "actionInfo[body]"
  };

  def(Action.prototype, "actionBlock", {
    get: function() {
      return new ActionBlock.Promise(this.resource);
    }
  });

  def(Action.prototype, "actionCounts", {
    get: function() {
      return new ActionCounts.Promise(this.resource);
    }
  });

  def(Action.prototype, "blockData", {
    get: function() {
      return this.attributes.sidebarContentModules[0];
    }
  });

  def(Action.prototype, "type", {
    get: function() {
      return this.blockData.type;
    }
  });

  Action.prototype.takeAction = function(attributes, callback) {
    var data, promise, url;
    url = [this.url, "take_action"].join("/");
    attributes = util.assign({}, attributes);
    if (attributes.refererUrl == null) {
      attributes.refererUrl = this.purpose.location();
    }
    data = util.transliterate(attributes, Action.attributesMapping);
    promise = this.purpose.ajax.api.post(url, data).then(function(response) {
      var _ref;
      if ((_ref = response.status) === (void 0) || _ref === 201 || _ref === 400) {
        return response;
      } else {
        return Promise.reject(response);
      }
    });
    attachPromiseCallback(promise, callback);
    return promise;
  };

  Action.prototype.feed = function(name, options) {
    if (options == null) {
      options = {};
    }
    return new Feed(this.resource, name, options);
  };

  return Action;

})(Resource);

module.exports = Action;

},{"../query_promise":36,"../resource":37,"../util":47,"./action_block":39,"./action_counts":40,"./feed":42}],39:[function(_dereq_,module,exports){
var ActionBlock, QueryPromise, Resource, def, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

QueryPromise = _dereq_("../query_promise");

Resource = _dereq_("../resource");

util = _dereq_("../util");

def = util.def;

ActionBlock = (function(_super) {
  __extends(ActionBlock, _super);

  ActionBlock.Promise = (function(_super1) {
    __extends(Promise, _super1);

    function Promise() {
      return Promise.__super__.constructor.apply(this, arguments);
    }

    Promise.prototype.model = ActionBlock;

    Promise.prototype.scope = "action_block";

    return Promise;

  })(QueryPromise);

  function ActionBlock() {
    ActionBlock.__super__.constructor.apply(this, arguments);
    this.title || (this.title = this.headline);
    this.statement = this.petitionStatement;
    this.pageId = this.resource.parent.id;
    this.facebookEnabled = !!Number(this.facebookEnabled);
    this.twitterEnabled = !!Number(this.twitterEnabled);
    this.emailEnabled = !!Number(this.emailEnabled);
    this.shareUrl || (this.shareUrl = this.purpose.shareUrl);
    this.currentUrl = this.shareUrl;
    this.tweet = util.stringTemplate(this.tweet, this);
    this.emailBody = util.stringTemplate(this.emailBody, this);
    this.twitterShareUrl = "https://twitter.com/intent/tweet?text=" + (encodeURIComponent(this.tweet));
    this.facebookShareUrl = "http://www.facebook.com/share.php?u=" + (encodeURIComponent(this.shareUrl));
    this.emailShareUrl = "mailto:?subject=" + (encodeURIComponent(this.emailSubject)) + "&body=" + (encodeURIComponent(this.emailBody));
  }

  return ActionBlock;

})(Resource);

module.exports = ActionBlock;

},{"../query_promise":36,"../resource":37,"../util":47}],40:[function(_dereq_,module,exports){
var ActionCounts, QueryPromise, Resource,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

QueryPromise = _dereq_("../query_promise");

Resource = _dereq_("../resource");

ActionCounts = (function(_super) {
  __extends(ActionCounts, _super);

  function ActionCounts() {
    return ActionCounts.__super__.constructor.apply(this, arguments);
  }

  ActionCounts.Promise = (function(_super1) {
    __extends(Promise, _super1);

    function Promise() {
      return Promise.__super__.constructor.apply(this, arguments);
    }

    Promise.prototype.model = ActionCounts;

    Promise.prototype.scope = "action_counts";

    return Promise;

  })(QueryPromise);

  return ActionCounts;

})(Resource);

module.exports = ActionCounts;

},{"../query_promise":36,"../resource":37}],41:[function(_dereq_,module,exports){
var Action, ActionSequence, QueryPromise, Resource, def,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

QueryPromise = _dereq_("../query_promise");

Resource = _dereq_("../resource");

Action = _dereq_("./action");

def = _dereq_("../util").def;

ActionSequence = (function(_super) {
  __extends(ActionSequence, _super);

  function ActionSequence() {
    return ActionSequence.__super__.constructor.apply(this, arguments);
  }

  ActionSequence.Promise = (function(_super1) {
    __extends(Promise, _super1);

    function Promise() {
      return Promise.__super__.constructor.apply(this, arguments);
    }

    Promise.prototype.model = ActionSequence;

    Promise.prototype.scope = "action_sequences";

    return Promise;

  })(QueryPromise);

  def(ActionSequence.prototype, "actions", {
    get: function() {
      var id;
      return this._actions || (this._actions = (function() {
        var _i, _len, _ref, _results;
        _ref = this.attributes.actionPages;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i].id;
          _results.push(new Action.Promise(this.resource.parent, id));
        }
        return _results;
      }).call(this));
    }
  });

  def(ActionSequence.prototype, "actionBlocks", {
    get: function() {
      var page, _i, _len, _ref, _results;
      _ref = this.actions();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        _results.push(page.actionBlock());
      }
      return _results;
    }
  });

  def(ActionSequence.prototype, "movement", {
    get: function() {
      return this.resource.parent;
    }
  });

  return ActionSequence;

})(Resource);

module.exports = ActionSequence;

},{"../query_promise":36,"../resource":37,"../util":47,"./action":38}],42:[function(_dereq_,module,exports){
var Feed, Promise, Resource, console, def, strftime, timers, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Resource = _dereq_("../resource");

strftime = _dereq_("strftime");

util = _dereq_("../util");

def = util.def, timers = util.timers, Promise = util.Promise, console = util.console;

Feed = (function(_super) {
  __extends(Feed, _super);

  Feed.Event = (function() {
    var letter, _fn, _i, _len, _ref;

    function Event(attributes) {
      util.assign(this, attributes);
      if (this.timestamp) {
        this.date = util.date(this.timestamp);
      }
    }

    _ref = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    _fn = function(letter) {
      var format;
      format = "%" + letter;
      return def(Event.prototype, format, {
        get: function() {
          if (this.date) {
            return strftime(format, this.date);
          }
        }
      });
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      letter = _ref[_i];
      _fn(letter);
    }

    return Event;

  })();

  function Feed(resource, name, options) {
    var _ref;
    this.resource = resource;
    this.name = name;
    if (options == null) {
      options = {};
    }
    if (options.interval) {
      this.interval = options.interval;
    }
    if (!this.name) {
      throw new Error("missing feed name");
    }
    _ref = this.resource, this.purpose = _ref.purpose, this.baseFeedUrl = _ref.baseFeedUrl;
    this.url = [this.baseFeedUrl, this.name].join("/");
  }

  Feed.prototype.running = false;

  Feed.prototype.interval = 60;

  Feed.prototype.backoffStrategy = [0, 2, 4, 8];

  Feed.prototype.start = function(callback) {
    var FAILURES_THRESHOLD, STOPPED, failure, failures, fetch, finish, reschedule, running, since, success;
    FAILURES_THRESHOLD = 4;
    STOPPED = "stopped";
    since = void 0;
    failures = 0;
    running = (function(_this) {
      return function(response) {
        if (_this.running) {
          if (response.success) {
            failures = 0;
            return response;
          } else {
            throw response;
          }
        } else {
          throw STOPPED;
        }
      };
    })(this);
    success = function(response) {
      var event, events, json;
      json = response.json();
      if (json.lastModified) {
        since = json.lastModified;
      }
      events = (function() {
        var _i, _len, _ref, _results;
        _ref = json.events || [];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          _results.push(new Feed.Event(event));
        }
        return _results;
      })();
      return callback(events);
    };
    failure = function(error) {
      if (error === STOPPED) {
        throw STOPPED;
      } else if (failures >= FAILURES_THRESHOLD) {
        console.error("[Feed] fail #" + failures + ":", error);
        throw error;
      } else {
        failures += 1;
        return console.warn("[Feed] fail #" + failures + " (retrying):", error);
      }
    };
    reschedule = (function(_this) {
      return function() {
        var interval, _ref;
        interval = (_ref = _this.backoffStrategy[failures - 1]) != null ? _ref : _this.interval;
        return new Promise(function(resolve, reject) {
          var fn;
          fn = function() {
            return resolve(fetch());
          };
          return timers.setTimeout(fn, interval * 1000);
        });
      };
    })(this);
    finish = function(error) {
      if (error === STOPPED) {
        return STOPPED;
      } else {
        throw error;
      }
    };
    fetch = (function(_this) {
      return function() {
        return _this.purpose.ajax.feed.get(_this.url, {
          since: since
        }).then(running, null).then(success, null).then(null, failure).then(reschedule, finish);
      };
    })(this);
    return this.running = fetch();
  };

  Feed.prototype.stop = function() {
    return this.running = false;
  };

  return Feed;

})(Resource);

module.exports = Feed;

},{"../resource":37,"../util":47,"strftime":8}],43:[function(_dereq_,module,exports){
var Action, ActionSequence, Movement, QueryPromise, Resource, attachPromiseCallback, def, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

QueryPromise = _dereq_("../query_promise");

Action = _dereq_("./action");

ActionSequence = _dereq_("./action_sequence");

Resource = _dereq_("../resource");

_ref = _dereq_("../util"), def = _ref.def, attachPromiseCallback = _ref.attachPromiseCallback;

Movement = (function(_super) {
  __extends(Movement, _super);

  function Movement() {
    return Movement.__super__.constructor.apply(this, arguments);
  }

  Movement.Promise = (function(_super1) {
    __extends(Promise, _super1);

    function Promise() {
      return Promise.__super__.constructor.apply(this, arguments);
    }

    Promise.prototype.model = Movement;

    Promise.prototype.scope = "movements";

    Promise.implement("action");

    Promise.implement("actionSequence");

    return Promise;

  })(QueryPromise);

  Movement.prototype.action = function(id, callback) {
    var promise;
    if ((id == null) || id === "") {
      throw new Error("missing Action id");
    }
    promise = new Action.Promise(this.resource, id);
    attachPromiseCallback(promise, callback);
    return promise;
  };

  Movement.prototype.actionSequence = function(id, callback) {
    var promise;
    if ((id == null) || id === "") {
      throw new Error("missing ActionSequence id");
    }
    promise = new ActionSequence.Promise(this.resource, id);
    attachPromiseCallback(promise, callback);
    return promise;
  };

  return Movement;

})(Resource);

module.exports = Movement;

},{"../query_promise":36,"../resource":37,"../util":47,"./action":38,"./action_sequence":41}],44:[function(_dereq_,module,exports){
var Promise, Template, dom, util,
  __slice = [].slice;

util = _dereq_("./util");

dom = _dereq_("./dom");

Promise = util.Promise;

Template = (function() {
  function Template() {}

  Template.prototype.pattern = function() {
    return /\{([\w\d@%$][^}]+)\}/g;
  };

  Template.prototype.processors = [];

  Template.prototype.processor = function(name, processor) {
    processor.name = name;
    return this.processors = this.processors.concat([processor]);
  };

  Template.prototype.processor("lookup", {
    lookup: function(_arg, _arg1) {
      var context, match, name, value;
      context = _arg[0];
      match = _arg1[0], name = _arg1[1];
      value = context[name];
      if (util.typeOf(value) === "[object Function]") {
        return value.call(context);
      } else {
        return value;
      }
    }
  });

  Template.prototype.processor("lookup-empty", {
    lookup: function(_arg, _arg1) {
      var context, match, name;
      context = _arg[0];
      match = _arg1[0], name = _arg1[1];
      if (name in context) {
        return "";
      }
    }
  });

  Template.prototype.processor("lookup-raw", {
    lookup: function(_arg, _arg1) {
      var context, match, name;
      context = _arg[0];
      match = _arg1[0], name = _arg1[1];
      if (/^@/.test(name)) {
        return context[name.slice(1) + "Raw"];
      }
    }
  });

  Template.prototype.processor("escape-social", {
    preprocess: function(data) {
      var key, raw, _i, _len, _ref, _results;
      _ref = ["tweet", "shareUrl", "emailSubject", "emailBody"];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        if (!(raw = data[key])) {
          continue;
        }
        data[key + "Raw"] = raw;
        _results.push(data[key] = encodeURIComponent(raw));
      }
      return _results;
    }
  });

  Template.prototype.safe = true;

  Template.prototype.attach = function(element) {
    var promises;
    promises = this._attach(element);
    return Promise.all(promises);
  };

  Template.prototype._attach = function(element, promises) {
    var attribute, child, _fn, _fn1, _i, _j, _len, _len1, _ref, _ref1;
    if (promises == null) {
      promises = [];
    }
    _ref = element.attributes;
    _fn = (function(_this) {
      return function(attribute) {
        return _this._process(promises, element, attribute, "value", function(value) {
          if (attribute.name === "data-prps-src") {
            return element.src = value;
          } else if (attribute.name === "data-prps-style") {
            return element.setAttribute("style", value);
          } else {
            return attribute.value = value;
          }
        });
      };
    })(this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      attribute = _ref[_i];
      _fn(attribute);
    }
    _ref1 = element.childNodes;
    _fn1 = (function(_this) {
      return function(child) {
        if (child.nodeType === (element.TEXT_NODE || 3)) {
          return _this._process(promises, element, child, "nodeValue", function(value) {
            var newNode, parent, parser;
            if (_this.safe) {
              return child.nodeValue = value;
            } else {
              parent = child.parentNode;
              parser = parent.cloneNode(false);
              parser.innerHTML = value;
              while (newNode = parser.childNodes[0]) {
                parent.insertBefore(newNode, child);
              }
              return parent.removeChild(child);
            }
          });
        } else if (child.nodeType === (element.ELEMENT_NODE || 1)) {
          if (!_this._ignore(child)) {
            return _this._attach(child, promises);
          }
        }
      };
    })(this);
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      child = _ref1[_j];
      _fn1(child);
    }
    return promises;
  };

  Template.prototype._ignore = function(element) {
    return element.hasAttribute("data-prps-action-block");
  };

  Template.prototype._process = function(promises, element, subject, property, callback) {
    if (this.pattern().test(subject[property])) {
      return promises.push(this._fetch(element, (function(_this) {
        return function() {
          var context, data, extra, processor, _i, _len, _ref;
          data = arguments[0], extra = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          data = util.create(data);
          context = [data].concat(__slice.call(extra));
          _ref = _this.processors;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            processor = _ref[_i];
            if (processor.preprocess) {
              processor.preprocess.apply(_this, context);
            }
          }
          return callback(subject[property].replace(_this.pattern(), function(match) {
            var value, _j, _len1, _ref1;
            _ref1 = _this.processors;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              processor = _ref1[_j];
              if (!processor.lookup) {
                continue;
              }
              value = processor.lookup.call(_this, context, arguments);
              if ((value != null) && value !== false) {
                break;
              }
            }
            return value != null ? value : match;
          }));
        };
      })(this)));
    }
  };

  return Template;

})();

module.exports = Template;

},{"./dom":17,"./util":47}],45:[function(_dereq_,module,exports){
var LocalTemplate, Template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Template = _dereq_("../template");

LocalTemplate = (function(_super) {
  __extends(LocalTemplate, _super);

  function LocalTemplate(purpose, data) {
    this.purpose = purpose;
    this.data = data;
  }

  LocalTemplate.prototype._fetch = function(element, callback) {
    return callback(this.data);
  };

  return LocalTemplate;

})(Template);

module.exports = LocalTemplate;

},{"../template":44}],46:[function(_dereq_,module,exports){
var Promise, RemoteTemplate, Template, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Template = _dereq_("../template");

util = _dereq_("../util");

Promise = util.Promise;

RemoteTemplate = (function(_super) {
  __extends(RemoteTemplate, _super);

  function RemoteTemplate(purpose) {
    this.purpose = purpose;
  }

  RemoteTemplate.prototype.pages = {};

  RemoteTemplate.prototype._fetchPage = function(element) {
    var page, _base, _name;
    page = this.purpose.action(element);
    return (_base = this.pages)[_name = page.url] || (_base[_name] = Promise.all([page.actionBlock(), page.actionCounts()]));
  };

  RemoteTemplate.prototype._fetch = function(element, callback) {
    return this._fetchPage(element).then(function(_arg) {
      var actionBlock, actionCount, attributes;
      actionBlock = _arg[0], actionCount = _arg[1];
      attributes = util.assign({}, actionBlock, actionCount);
      return callback(attributes);
    });
  };

  return RemoteTemplate;

})(Template);

module.exports = RemoteTemplate;

},{"../template":44,"../util":47}],47:[function(_dereq_,module,exports){
exports.Promise = _dereq_("./util/promise");

exports.StateMachine = _dereq_("./util/state_machine");

exports.attachPromiseCallback = _dereq_("./util/attach_promise_callback");

exports.stringTemplate = _dereq_("./util/string_template");

exports.transliterate = _dereq_("./util/transliterate");

exports.parseNumber = _dereq_("./util/parse_number");

exports.typeOf = _dereq_("./util/typeof");

exports.create = _dereq_("./util/create");

exports.assign = _dereq_("./util/assign");

exports.def = _dereq_("./util/def");

exports.trim = _dereq_("./util/trim");

exports.indexOf = _dereq_("./util/index_of");

exports.some = _dereq_("./util/some");

exports.every = _dereq_("./util/every");

exports.date = _dereq_("./util/date");

exports.timers = _dereq_("./util/timers");

exports.console = _dereq_("./util/console");

},{"./util/assign":48,"./util/attach_promise_callback":49,"./util/console":50,"./util/create":51,"./util/date":52,"./util/def":53,"./util/every":54,"./util/index_of":55,"./util/parse_number":56,"./util/promise":57,"./util/some":58,"./util/state_machine":59,"./util/string_template":60,"./util/timers":61,"./util/transliterate":62,"./util/trim":63,"./util/typeof":64}],48:[function(_dereq_,module,exports){
var __slice = [].slice,
  __hasProp = {}.hasOwnProperty;

module.exports = function() {
  var key, o, obj, objects, value, _i, _len;
  obj = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  for (_i = 0, _len = objects.length; _i < _len; _i++) {
    o = objects[_i];
    for (key in o) {
      if (!__hasProp.call(o, key)) continue;
      value = o[key];
      obj[key] = value;
    }
  }
  return obj;
};

},{}],49:[function(_dereq_,module,exports){
module.exports = function(promise, callback) {
  var failure, success;
  if (callback) {
    success = function(response) {
      return callback(response, void 0);
    };
    failure = function(response) {
      return callback(void 0, response);
    };
    return promise.then(success, failure);
  }
};

},{}],50:[function(_dereq_,module,exports){
var log,
  __slice = [].slice;

log = function() {
  var args, type;
  type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (typeof console !== "undefined" && console !== null ? console[type] : void 0) {
    return console[type].apply(console, args);
  } else if (typeof console !== "undefined" && console !== null ? console.log : void 0) {
    return console.log.apply(console, ["[" + (type.toUpperCase()) + "]"].concat(__slice.call(args)));
  } else {

  }
};

module.exports = {
  log: function() {
    return log.apply(null, ["log"].concat(__slice.call(arguments)));
  },
  info: function() {
    return log.apply(null, ["info"].concat(__slice.call(arguments)));
  },
  warn: function() {
    return log.apply(null, ["warn"].concat(__slice.call(arguments)));
  },
  error: function() {
    return log.apply(null, ["error"].concat(__slice.call(arguments)));
  }
};

},{}],51:[function(_dereq_,module,exports){
module.exports = function(proto) {
  var obj;
  obj = function() {};
  obj.prototype = proto;
  return new obj();
};

},{}],52:[function(_dereq_,module,exports){
module.exports = function(iso8601) {
  var component, date, hour, minute, month, second, year, _ref;
  _ref = (function() {
    var _i, _len, _ref, _results;
    _ref = iso8601.match(/\d+/g);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      component = _ref[_i];
      _results.push(parseInt(component, 10));
    }
    return _results;
  })(), year = _ref[0], month = _ref[1], date = _ref[2], hour = _ref[3], minute = _ref[4], second = _ref[5];
  return new Date(year, month - 1, date, hour, minute, second);
};

},{}],53:[function(_dereq_,module,exports){
var util;

util = _dereq_("util");

module.exports = function(object, name, options) {
  var get, impl, propertyName, set;
  if (options == null) {
    options = {};
  }
  propertyName = "_property_" + name;
  get = options.get || function() {
    return this[propertyName];
  };
  set = options.set || function(value) {
    return this[propertyName] = value;
  };
  impl = function() {
    if (arguments.length === 0) {
      return get.apply(this, arguments);
    } else {
      return set.apply(this, arguments);
    }
  };
  impl.toString = function() {
    var owner, _ref, _ref1;
    owner = (_ref = (_ref1 = object.constructor) != null ? _ref1.name : void 0) != null ? _ref : object;
    return "" + owner + "#" + name + " accessor";
  };
  return object[name] = impl;
};

},{"util":5}],54:[function(_dereq_,module,exports){
module.exports = function(list, callback) {
  var index, item, _i, _len;
  for (index = _i = 0, _len = list.length; _i < _len; index = ++_i) {
    item = list[index];
    if (!callback(item, index, list)) {
      return false;
    }
  }
  return true;
};

},{}],55:[function(_dereq_,module,exports){
module.exports = function(list, item) {
  var element, index, _i, _len;
  for (index = _i = 0, _len = list.length; _i < _len; index = ++_i) {
    element = list[index];
    if (element === item) {
      return index;
    }
  }
  return -1;
};

},{}],56:[function(_dereq_,module,exports){
module.exports = function(value, defaultNumber) {
  var parsed;
  if (defaultNumber == null) {
    defaultNumber = NaN;
  }
  parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return defaultNumber;
  } else {
    return parsed;
  }
};

},{}],57:[function(_dereq_,module,exports){
var RSVP, console,  Promise;

RSVP = _dereq_("rsvp");

 Promise = RSVP. Promise;

console = _dereq_("./console");

Promise.prototype.done = function() {
  if (arguments.length) {
    return this.then.apply(this, arguments).done();
  } else {
    return this.then(null, console.error);
  }
};

module.exports = Promise;

},{"./console":50,"rsvp":7}],58:[function(_dereq_,module,exports){
module.exports = function(list, callback) {
  var index, item, _i, _len;
  for (index = _i = 0, _len = list.length; _i < _len; index = ++_i) {
    item = list[index];
    if (callback(item, index, list)) {
      return true;
    }
  }
  return false;
};

},{}],59:[function(_dereq_,module,exports){
var StateMachine;

StateMachine = (function() {
  function StateMachine(initial, onTransition) {
    if (initial == null) {
      initial = "initial";
    }
    if (onTransition == null) {
      onTransition = null;
    }
    if (onTransition != null) {
      this.onTransition = onTransition;
    }
    this.current = initial;
    this.onTransition(null, this.current);
  }

  StateMachine.prototype.onTransition = function() {};

  StateMachine.prototype.transitions = {};

  StateMachine.prototype.canTransitionTo = function(to) {
    var _ref;
    return !!((_ref = this.transitions[this.current]) != null ? _ref[to] : void 0);
  };

  StateMachine.prototype.transitionTo = function(to, fn) {
    var from;
    if (fn == null) {
      fn = null;
    }
    from = this.current;
    if (this.canTransitionTo(to)) {
      this.current = to;
      this.onTransition(from, to);
      if (fn) {
        return fn.call(this, from, to);
      } else {
        return true;
      }
    } else if (fn) {
      return false;
    } else {
      throw new Error("Cannot transition from '" + from + "' into '" + to + "'");
    }
  };

  return StateMachine;

})();

module.exports = StateMachine;

},{}],60:[function(_dereq_,module,exports){
module.exports = function(template, context) {
  if (template) {
    return template.replace(/\{([\w\d]+)\}/gi, function(_, name) {
      return (context != null ? context[name] : void 0) || "";
    });
  }
};

},{}],61:[function(_dereq_,module,exports){
exports.setTimeout = function() {
  return setTimeout.apply(window, arguments);
};

exports.clearTimeout = function() {
  return clearTimeout.apply(window, arguments);
};

},{}],62:[function(_dereq_,module,exports){
var util,
  __slice = [].slice;

util = _dereq_("../util");

module.exports = function(object, table) {
  var clone, from, key, keys, lastKey, target, to, _i, _j, _len, _ref;
  clone = util.assign({}, object);
  for (from in table) {
    to = table[from];
    if (!(from in object)) {
      continue;
    }
    _ref = to.match(/\w+/g), keys = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), lastKey = _ref[_i++];
    target = clone;
    for (_j = 0, _len = keys.length; _j < _len; _j++) {
      key = keys[_j];
      target = (target[key] || (target[key] = {}));
    }
    target[lastKey] = object[from];
    delete clone[from];
  }
  return clone;
};

},{"../util":47}],63:[function(_dereq_,module,exports){
module.exports = function(string) {
  return string.replace(/^\s+|\s+$/g, "");
};

},{}],64:[function(_dereq_,module,exports){
var fn;

fn = {}.toString;

module.exports = function(object) {
  return fn.call(object);
};

},{}]},{},[35])
(35)
});