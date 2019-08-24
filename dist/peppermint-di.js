(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("peppermint-di", [], factory);
	else if(typeof exports === 'object')
		exports["peppermint-di"] = factory();
	else
		root["peppermint-di"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/container.ts":
/*!**************************!*\
  !*** ./src/container.ts ***!
  \**************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Container = void 0;

__webpack_require__(/*! reflect-metadata */ "reflect-metadata");

var _errors = __webpack_require__(/*! ./errors */ "./src/errors/index.ts");

var _resolveOptions = __webpack_require__(/*! ./resolveOptions */ "./src/resolveOptions.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function emptyLogger(msg) {} // noop

/**
 * A dependency injection container
 *
 * Based on: 
 * https://stackoverflow.com/questions/20058391/javascript-dependency-injection
 * http://www.yusufaytas.com/dependency-injection-in-javascript/
 */


class Container {
  static get canReflect() {
    if (Container._canReflect === undefined) {
      try {
        Container._canReflect = Reflect && Reflect.construct ? true : false;
      } catch (e) {
        Container._canReflect = false;
      }
    }

    return Container._canReflect;
  }

  /**
   * @param logger Optional logger method. E.g. console.log.
   */
  constructor(logger) {
    _defineProperty(this, "logger", void 0);

    _defineProperty(this, "factories", new Map());

    _defineProperty(this, "initializers", new Map());

    _defineProperty(this, "potentialSingletons", new Map());

    _defineProperty(this, "singletons", new Map());

    this.logger = logger || emptyLogger;
  } // --- public methods --- //

  /**
   * Register a transient dependency.
   * 
   * @param key The type to register.
   * @param type Optional. Concrete type to return instead of the 'key' parameter.
   */


  register(key, type) {
    this.validateKey(key);
    const keyStr = this.getKeyString(key); // key is constructor

    if ((type === null || type === undefined) && typeof key === 'function') {
      this.logger(`Registering '${keyStr}' (${"key"} as constructor)`);
      this.factories.set(key, () => {
        return this.resolveCTor(key, null);
      });
    } else if (type) {
      if (typeof type !== 'function') throw new Error(`Invalid argument '${"type"}'. Constructor function expected.`); // key is primitive or "interface type", type is concrete type

      this.logger(`Registering '${keyStr}' (${"type"} as constructor)`);
      this.factories.set(key, () => {
        return this.resolveCTor(type, null);
      });
    } else {
      throw new Error(`Missing argument '${"type"}'.`);
    }
  }
  /**
   * Register a transient dependency.
   */


  registerFactory(key, factory) {
    this.validateKey(key);
    if (typeof factory !== 'function') throw new Error(`Invalid argument '${"factory"}'. Factory function expected.`);
    const keyStr = this.getKeyString(key);
    this.logger(`Registering '${keyStr}' (factory callback)`);
    this.factories.set(key, factory);
  }
  /**
   * Register a singleton dependency.
   *
   * @param key The type to register.
   * @param value Singleton object or a constructor function that will be
   * called once and it's result will be cached and re-served.
   */


  registerSingle(key, value) {
    this.validateKey(key);
    const keyStr = this.getKeyString(key);

    if ((value === null || value === undefined) && typeof key === 'function') {
      this.logger(`Registering '${keyStr}' as singleton (${"key"} as constructor)`);
      this.potentialSingletons.set(key, () => {
        return this.resolveCTor(key, null);
      });
    } else if (typeof value === 'object') {
      this.logger(`Registering '${keyStr}' as singleton (value as instance)`);
      this.singletons.set(key, value);
    } else if (typeof value === 'function') {
      this.logger(`Registering '${keyStr}' as singleton (value as constructor)`);
      this.potentialSingletons.set(key, () => {
        return this.resolveCTor(value, null);
      });
    } else {
      throw new Error(`Invalid argument '${"value"}'. Expected object or function.`);
    }
  }
  /**
   * Register a singleton dependency.
   */


  registerSingleFactory(key, factory) {
    this.validateKey(key);
    if (typeof factory !== 'function') throw new Error(`Invalid argument '${"factory"}'. Factory function expected.`);
    const keyStr = this.getKeyString(key);
    this.logger(`Registering '${keyStr}' as singleton (factory callback)`);
    this.potentialSingletons.set(key, factory);
  }
  /**
   * Register an initializer to be invoked each time a new instance of T is
   * created by the container.
   */


  registerInitializer(key, initializer) {
    this.validateKey(key);
    if (typeof initializer !== 'function') throw new Error(`Invalid argument '${"initializer"}'. Initializer function expected.`);
    const keyStr = this.getKeyString(key);
    this.logger(`Registering an initializer for '${keyStr}'`);
    let initializersList = this.initializers.get(key);

    if (!initializersList) {
      initializersList = [];
      this.initializers.set(key, initializersList);
    }

    initializersList.push(initializer);
  }
  /**
   * Get an instance of T.
   */


  get(key, options) {
    this.validateKey(key);
    return this.resolveSingleDependency(key, options);
  }
  /**
   * Resolve function arguments and call it.
   */


  call(foo, thisArg, options) {
    const dependencies = this.resolveDependencies(foo, options);
    return foo.apply(thisArg, dependencies);
  } // --- private methods --- //


  validateKey(key) {
    if (typeof key !== 'string' && typeof key !== 'function' && typeof key !== 'symbol') throw new Error(`Invalid argument '${"key"}'. Expected string, symbol or function. Received: ${JSON.stringify(key)}.`);
  }

  getKeyString(key) {
    if (typeof key === 'string') return key;
    if (typeof key === 'function') return key.name;
    return key.toString();
  }
  /**
   * resolve dependency using:
   * 1. parameters supplied by caller
   * 2. registered factories
   * 3. registered singletons
   * 4. construct
   */


  resolveSingleDependency(key, options) {
    const keyStr = this.getKeyString(key);
    options = Object.assign(new _resolveOptions.ResolveOptions(), options || {}); // from params

    if (options.params) {
      const fromParams = options.params.get(key);

      if (fromParams !== undefined) {
        this.logger(`Resolving '${keyStr}' from params`);
        return fromParams;
      }
    } // from factories


    const factory = this.factories.get(key);

    if (factory !== undefined) {
      this.logger(`Resolving '${keyStr}' from internal registry`);
      const instance = this.resolveFactory(key, factory);
      this.initializeInstance(key, instance);
      return instance;
    } // from singletons


    const singleton = this.singletons.get(key);

    if (singleton !== undefined) {
      this.logger(`Resolving '${keyStr}' from internal registry (singleton)`);
      return singleton;
    } // from singleton factories


    const singletonFactory = this.potentialSingletons.get(key);

    if (singletonFactory !== undefined) {
      this.logger(`Resolving '${keyStr}' from internal registry (singleton factory)`);
      return this.resolveSingletonFactory(key, singletonFactory);
    } // dependency not registered...
    // construct


    if (options.constructUnregistered && typeof key === 'function') {
      this.logger(`Resolving '${keyStr}' by invoking as constructor`);
      const instance = this.resolveCTor(key, options);
      this.initializeInstance(key, instance);
      return instance;
    } // treat as optional parameter


    if (options.optionalParameters) {
      this.logger(`Resolving '${keyStr}' as optional parameter (undefined)`);
      return undefined;
    }

    throw new _errors.ResolveError(keyStr, new Error('Dependency is not registered.'));
  }

  resolveFactory(key, factory) {
    try {
      return factory();
    } catch (e) {
      const keyStr = this.getKeyString(key);
      throw new _errors.ResolveError(keyStr, e);
    }
  }

  resolveSingletonFactory(key, singletonFactory) {
    const keyStr = this.getKeyString(key); // create the singleton

    let singleton;

    try {
      singleton = singletonFactory();
    } catch (e) {
      throw new _errors.ResolveError(keyStr, e);
    } // initialize the singleton instance


    this.initializeInstance(key, singleton); // cache it

    try {
      this.singletons.set(key, singleton);
    } catch (e) {
      throw new _errors.ResolveError(keyStr, e);
    } // delete the singleton factory


    this.potentialSingletons.delete(key);
    return singleton;
  }

  resolveCTor(ctor, options) {
    const dependencies = this.resolveDependencies(ctor, options);

    if (Container.canReflect) {
      return Reflect.construct(ctor, dependencies);
    } else {
      // a workaround to allow calling a constructor through .apply
      // see: http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
      const MiddlemanCTor = function () {
        ctor.apply(this, dependencies);
      };

      MiddlemanCTor.prototype = ctor.prototype;
      return new MiddlemanCTor();
    }
  }

  initializeInstance(key, instance) {
    const initializersList = this.initializers.get(key);
    if (!initializersList) return;

    for (const initializer of initializersList) {
      initializer(instance);
    }
  }

  resolveDependencies(func, options) {
    if (typeof func !== 'function') throw new Error(`Invalid argument '${"func"}'. Expected function.`);
    const args = this.getArgumentKeys(func);
    const dependencies = [];

    for (const argKey of args) {
      let dependency;

      try {
        dependency = this.resolveSingleDependency(argKey, options);
      } catch (e) {
        throw new _errors.ResolveError(func.name || '<anonymous>', e);
      }

      dependencies.push(dependency);
    }

    return dependencies;
  }

  getArgumentKeys(func) {
    const argNames = this.getArgumentNames(func);
    const argTypes = this.getArgumentTypes(func); // no type information

    if (!argTypes || !argTypes.length) return argNames; // mismatch length - unknown error

    if (argNames.length !== argTypes.length) throw new Error('Failed reflecting function arguments.'); // fill missing type info by using argument name

    const args = argTypes.map((type, index) => {
      if (!type) throw new _errors.TypeInferenceError(`Can not infer type of argument in index ${index} of the function '${func.name}'.`); // primitives are never registered as dependency...

      if (type.name !== 'Object' && type.name !== 'String') return type;
      return argNames[index];
    }); // log

    const argsStr = args.map(arg => {
      if (typeof arg === 'function') return arg.name;
      return arg;
    });
    this.logger(`Arguments of '${func.name}': ${JSON.stringify(argsStr)}`); // return

    return args;
  }

  getArgumentNames(func) {
    // original regex from require.js
    const FN_ARGS = /^function\s*?[^\(]*?\(\s*?([^\)]*?)\)/m;
    const CLASS_CTOR_ARGS = /^class[\s\S]*?constructor\s*?[^\(]*?\(\s*?([^\)]*?)\)/m;
    const functionArgsRegex = func.toString().match(FN_ARGS);
    const classArgsRegex = func.toString().match(CLASS_CTOR_ARGS);
    let args;

    if (classArgsRegex && classArgsRegex.length) {
      this.logger(`Function '${func.name}' declared as es5 class`);
      args = classArgsRegex[1];
    } else if (functionArgsRegex && functionArgsRegex.length) {
      this.logger(`Function '${func.name}' declared as standard function`);
      args = functionArgsRegex[1];
    } else {
      // Get here if:
      // 1. It's a class declaration but no constructor was specified
      // 2. Unknown parse error... Should improve the regex...
      this.logger(`Could not detect arguments of '${func.name}'`);
      return [];
    }

    args = args.split(',').map(str => str.trim()).filter(arg => arg !== '');
    return args;
  }

  getArgumentTypes(func) {
    if (Container.canReflect) {
      // https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
      return Reflect.getMetadata('design:paramtypes', func);
    }

    return [];
  }

}

exports.Container = Container;

_defineProperty(Container, "_canReflect", void 0);

/***/ }),

/***/ "./src/errors/index.ts":
/*!*****************************!*\
  !*** ./src/errors/index.ts ***!
  \*****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nestedError = __webpack_require__(/*! ./nestedError */ "./src/errors/nestedError.ts");

Object.keys(_nestedError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _nestedError[key];
    }
  });
});

var _resolveError = __webpack_require__(/*! ./resolveError */ "./src/errors/resolveError.ts");

Object.keys(_resolveError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _resolveError[key];
    }
  });
});

var _typeInferenceError = __webpack_require__(/*! ./typeInferenceError */ "./src/errors/typeInferenceError.ts");

Object.keys(_typeInferenceError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _typeInferenceError[key];
    }
  });
});

/***/ }),

/***/ "./src/errors/nestedError.ts":
/*!***********************************!*\
  !*** ./src/errors/nestedError.ts ***!
  \***********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NestedError = void 0;

/**
 * An Error that preserves inner Error's stack trace
 */
class NestedError extends Error {
  static createStack(myStack, innerError) {
    if (!innerError) return myStack;
    myStack += '\n------------------------------------------------\n';
    myStack += 'Inner Error: ';

    if (innerError instanceof Error) {
      myStack += innerError.stack;
    } else {
      myStack += innerError.toString();
    }

    return myStack;
  }

  constructor(message, innerError) {
    super(message);
    this.stack = NestedError.createStack(this.stack, innerError); // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, NestedError.prototype);
  }

}

exports.NestedError = NestedError;

/***/ }),

/***/ "./src/errors/resolveError.ts":
/*!************************************!*\
  !*** ./src/errors/resolveError.ts ***!
  \************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResolveError = void 0;

var _nestedError = __webpack_require__(/*! ./nestedError */ "./src/errors/nestedError.ts");

class ResolveError extends _nestedError.NestedError {
  constructor(key, innerErr) {
    super(`Failed to resolve '${key}'.`, innerErr); // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, ResolveError.prototype);
  }

}

exports.ResolveError = ResolveError;

/***/ }),

/***/ "./src/errors/typeInferenceError.ts":
/*!******************************************!*\
  !*** ./src/errors/typeInferenceError.ts ***!
  \******************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeInferenceError = void 0;

class TypeInferenceError extends Error {
  constructor(message) {
    super(message); // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, TypeInferenceError.prototype);
  }

}

exports.TypeInferenceError = TypeInferenceError;

/***/ }),

/***/ "./src/i.ts":
/*!******************!*\
  !*** ./src/i.ts ***!
  \******************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.i = i;

__webpack_require__(/*! reflect-metadata */ "reflect-metadata");

/**
 * Declare the interface type of a parameter.
 *
 * Example:
 * 
 * class MyClass {
 *    constructor(@i(IMyService) myService: IMyService) {
 *      ...
 *    }
 * }
 * 
 * To see more about how or why it works read here:
 * https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
function i(interfaceSymbol) {
  return (target, parameterName, parameterIndex) => {
    const paramTypes = Reflect.getMetadata('design:paramtypes', target);
    paramTypes[parameterIndex] = interfaceSymbol;
    Reflect.defineMetadata('design:paramtypes', paramTypes, target);
  };
}

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _errors = __webpack_require__(/*! ./errors */ "./src/errors/index.ts");

Object.keys(_errors).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _errors[key];
    }
  });
});

var _container = __webpack_require__(/*! ./container */ "./src/container.ts");

Object.keys(_container).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _container[key];
    }
  });
});

var _i = __webpack_require__(/*! ./i */ "./src/i.ts");

Object.keys(_i).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _i[key];
    }
  });
});

var _injectable = __webpack_require__(/*! ./injectable */ "./src/injectable.ts");

Object.keys(_injectable).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _injectable[key];
    }
  });
});

var _resolveOptions = __webpack_require__(/*! ./resolveOptions */ "./src/resolveOptions.ts");

Object.keys(_resolveOptions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _resolveOptions[key];
    }
  });
});

var _types = __webpack_require__(/*! ./types */ "./src/types.ts");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});

/***/ }),

/***/ "./src/injectable.ts":
/*!***************************!*\
  !*** ./src/injectable.ts ***!
  \***************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectable = injectable;

/**
 * Indicates that the decorated class can have it's constructor parameters injected.
 */
function injectable(constructor) {// no-op
}

/***/ }),

/***/ "./src/resolveOptions.ts":
/*!*******************************!*\
  !*** ./src/resolveOptions.ts ***!
  \*******************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResolveOptions = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ResolveOptions {
  constructor() {
    _defineProperty(this, "optionalParameters", false);

    _defineProperty(this, "constructUnregistered", true);

    _defineProperty(this, "params", void 0);
  }

}

exports.ResolveOptions = ResolveOptions;

/***/ }),

/***/ "./src/types.ts":
/*!**********************!*\
  !*** ./src/types.ts ***!
  \**********************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\Alon\Documents\devel\peppermint-di\src\index.ts */"./src/index.ts");


/***/ }),

/***/ "reflect-metadata":
/*!***********************************!*\
  !*** external "reflect-metadata" ***!
  \***********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("reflect-metadata");

/***/ })

/******/ });
});
//# sourceMappingURL=peppermint-di.js.map