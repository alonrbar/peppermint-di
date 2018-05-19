(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("peppermint-di", [], factory);
	else if(typeof exports === 'object')
		exports["peppermint-di"] = factory();
	else
		root["peppermint-di"] = factory();
})(window, function() {
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
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

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
var resolveOptions_1 = __webpack_require__(/*! ./resolveOptions */ "./src/resolveOptions.ts");
var errors_1 = __webpack_require__(/*! ./errors */ "./src/errors/index.ts");
function emptyLogger(msg) {
}
var Container = (function () {
    function Container(logger) {
        this.factories = new Map();
        this.potentialSingletons = new Map();
        this.singletons = new Map();
        this.logger = logger || emptyLogger;
    }
    Object.defineProperty(Container, "canReflect", {
        get: function () {
            if (Container._canReflect === undefined) {
                try {
                    Container._canReflect = (Reflect && Reflect.construct) ? true : false;
                }
                catch (e) {
                    Container._canReflect = false;
                }
            }
            return Container._canReflect;
        },
        enumerable: true,
        configurable: true
    });
    Container.prototype.register = function (key, type) {
        var _this = this;
        this.validateKey(key);
        var keyStr = this.getKeyString(key);
        if ((type === null || type === undefined) && typeof key === 'function') {
            this.logger("Registering '" + keyStr + "' (" + "key" + " as constructor)");
            this.factories.set(key, function () {
                return _this.resolveCTor(key, null);
            });
        }
        else if (type) {
            if (typeof type !== 'function') {
                throw new Error("Invalid argument '" + "type" + "'. Constructor function expected.");
            }
            this.logger("Registering '" + keyStr + "' (" + "type" + " as constructor)");
            this.factories.set(key, function () {
                return _this.resolveCTor(type, null);
            });
        }
        else {
            throw new Error("Missing argument '" + "type" + "'.");
        }
    };
    Container.prototype.registerFactory = function (key, factory) {
        this.validateKey(key);
        if (typeof factory !== 'function')
            throw new Error("Invalid argument '" + factory + "'. Factory function expected.");
        var keyStr = this.getKeyString(key);
        this.logger("Registering '" + keyStr + "' (factory callback)");
        this.factories.set(key, factory);
    };
    Container.prototype.registerSingle = function (key, value) {
        var _this = this;
        this.validateKey(key);
        var keyStr = this.getKeyString(key);
        if ((value === null || value === undefined) && typeof key === 'function') {
            this.logger("Registering '" + keyStr + "' as singleton (" + "key" + " as constructor)");
            this.potentialSingletons.set(key, function () {
                return _this.resolveCTor(key, null);
            });
        }
        else if (typeof value === 'object') {
            this.logger("Registering '" + keyStr + "' as singleton (value as instance)");
            this.singletons.set(key, value);
        }
        else if (typeof value === 'function') {
            this.logger("Registering '" + keyStr + "' as singleton (value as constructor)");
            this.potentialSingletons.set(key, function () {
                return _this.resolveCTor(value, null);
            });
        }
        else {
            throw new Error("Invalid argument '" + "value" + "'. Expected object or function.");
        }
    };
    Container.prototype.registerSingleFactory = function (key, factory) {
        this.validateKey(key);
        if (typeof factory !== 'function')
            throw new Error("Invalid argument '" + factory + "'. Factory function expected.");
        var keyStr = this.getKeyString(key);
        this.logger("Registering '" + keyStr + "' as singleton (factory callback)");
        this.potentialSingletons.set(key, factory);
    };
    Container.prototype.get = function (key, options) {
        this.validateKey(key);
        return this.resolveSingleDependency(key, options);
    };
    Container.prototype.call = function (foo, thisArg, options) {
        var dependencies = this.resolveDependencies(foo, options);
        return foo.apply(thisArg, dependencies);
    };
    Container.prototype.validateKey = function (key) {
        if (typeof key !== 'string' && typeof key !== 'function' && typeof key !== 'symbol')
            throw new Error("Invalid argument '" + "key" + "'. Expected string, symbol or function. Received: " + JSON.stringify(key) + ".");
    };
    Container.prototype.getKeyString = function (key) {
        if (typeof key === 'string')
            return key;
        if (typeof key === 'function')
            return key.name;
        return key.toString();
    };
    Container.prototype.resolveSingleDependency = function (key, options) {
        var keyStr = this.getKeyString(key);
        options = new resolveOptions_1.ResolveOptions(options);
        var fromParams = options.params[keyStr];
        if (fromParams !== undefined) {
            this.logger("Resolving '" + keyStr + "' from params");
            return fromParams;
        }
        var factory = this.factories.get(key);
        if (factory !== undefined) {
            this.logger("Resolving '" + keyStr + "' from internal registry");
            return this.resolveFactory(key, factory);
        }
        var singleton = this.singletons.get(key);
        if (singleton !== undefined) {
            this.logger("Resolving '" + keyStr + "' from internal registry (singleton)");
            return singleton;
        }
        var singletonFactory = this.potentialSingletons.get(key);
        if (singletonFactory !== undefined) {
            this.logger("Resolving '" + keyStr + "' from internal registry (singleton factory)");
            return this.resolveSingletonFactory(key, singletonFactory);
        }
        if (options.constructUnregistered && typeof key === 'function') {
            this.logger("Resolving '" + keyStr + "' by invoking as constructor");
            return this.resolveCTor(key, options);
        }
        if (options.optionalParameters) {
            this.logger("Resolving '" + keyStr + "' as optional parameter (undefined)");
            return undefined;
        }
        throw new errors_1.ResolveError(keyStr, new Error('Dependency is not registered.'));
    };
    Container.prototype.resolveFactory = function (key, factory) {
        try {
            return factory();
        }
        catch (e) {
            var keyStr = this.getKeyString(key);
            throw new errors_1.ResolveError(keyStr, e);
        }
    };
    Container.prototype.resolveSingletonFactory = function (key, singletonFactory) {
        var keyStr = this.getKeyString(key);
        var singleton;
        try {
            singleton = singletonFactory();
        }
        catch (e) {
            throw new errors_1.ResolveError(keyStr, e);
        }
        try {
            this.singletons.set(key, singleton);
        }
        catch (e) {
            throw new errors_1.ResolveError(keyStr, e);
        }
        this.potentialSingletons.delete(key);
        return singleton;
    };
    Container.prototype.resolveCTor = function (ctor, options) {
        var dependencies = this.resolveDependencies(ctor, options);
        if (Container.canReflect) {
            return Reflect.construct(ctor, dependencies);
        }
        else {
            var MiddlemanCTor = function () {
                ctor.apply(this, dependencies);
            };
            MiddlemanCTor.prototype = ctor.prototype;
            return new MiddlemanCTor();
        }
    };
    Container.prototype.resolveDependencies = function (func, options) {
        if (typeof func !== 'function')
            throw new Error("Invalid argument '" + "func" + "'. Expected function.");
        var args = this.getArgumentKeys(func);
        var dependencies = [];
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var argKey = args_1[_i];
            var dependency = void 0;
            try {
                dependency = this.resolveSingleDependency(argKey, options);
            }
            catch (e) {
                throw new errors_1.ResolveError(func.name || '<anonymous>', e);
            }
            dependencies.push(dependency);
        }
        return dependencies;
    };
    Container.prototype.getArgumentKeys = function (func) {
        var argNames = this.getArgumentNames(func);
        var argTypes = this.getArgumentTypes(func);
        if (!argTypes || !argTypes.length)
            return argNames;
        if (argNames.length !== argTypes.length)
            throw new Error('Failed reflecting function arguments.');
        var args = argTypes.map(function (type, index) {
            if (!type)
                throw new errors_1.TypeInferenceError("Can not infer type of argument in index " + index + " of the function '" + func.name + "'.");
            if (type.name !== 'Object' && type.name !== 'String')
                return type;
            return argNames[index];
        });
        var argsStr = args.map(function (arg) {
            if (typeof arg === 'function')
                return arg.name;
            return arg;
        });
        this.logger("Arguments of '" + func.name + "': " + JSON.stringify(argsStr));
        return args;
    };
    Container.prototype.getArgumentNames = function (func) {
        var FN_ARGS = /^function\s*?[^\(]*?\(\s*?([^\)]*?)\)/m;
        var CLASS_CTOR_ARGS = /^class[\s\S]*?constructor\s*?[^\(]*?\(\s*?([^\)]*?)\)/m;
        var functionArgsRegex = func.toString().match(FN_ARGS);
        var classArgsRegex = func.toString().match(CLASS_CTOR_ARGS);
        var args;
        if (classArgsRegex && classArgsRegex.length) {
            this.logger("Function '" + func.name + "' declared as es5 class");
            args = classArgsRegex[1];
        }
        else if (functionArgsRegex && functionArgsRegex.length) {
            this.logger("Function '" + func.name + "' declared as standard function");
            args = functionArgsRegex[1];
        }
        else {
            this.logger("Could not detect arguments of '" + func.name + "'");
            return [];
        }
        args = args.split(',')
            .map(function (str) { return str.trim(); })
            .filter(function (arg) { return arg !== ''; });
        return args;
    };
    Container.prototype.getArgumentTypes = function (func) {
        if (Container.canReflect) {
            return Reflect.getMetadata('design:paramtypes', func);
        }
        return [];
    };
    return Container;
}());
exports.Container = Container;


/***/ }),

/***/ "./src/errors/index.ts":
/*!*****************************!*\
  !*** ./src/errors/index.ts ***!
  \*****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./nestedError */ "./src/errors/nestedError.ts"));
__export(__webpack_require__(/*! ./resolveError */ "./src/errors/resolveError.ts"));
__export(__webpack_require__(/*! ./typeInferenceError */ "./src/errors/typeInferenceError.ts"));


/***/ }),

/***/ "./src/errors/nestedError.ts":
/*!***********************************!*\
  !*** ./src/errors/nestedError.ts ***!
  \***********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var NestedError = (function (_super) {
    __extends(NestedError, _super);
    function NestedError(message, innerError) {
        var _this = _super.call(this, message) || this;
        _this.stack = NestedError.createStack(_this.stack, innerError);
        Object.setPrototypeOf(_this, NestedError.prototype);
        return _this;
    }
    NestedError.createStack = function (myStack, innerError) {
        if (!innerError)
            return myStack;
        myStack += '\n------------------------------------------------\n';
        myStack += 'Inner Error: ';
        if (innerError instanceof Error) {
            myStack += innerError.stack;
        }
        else {
            myStack += innerError.toString();
        }
        return myStack;
    };
    return NestedError;
}(Error));
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

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var nestedError_1 = __webpack_require__(/*! ./nestedError */ "./src/errors/nestedError.ts");
var ResolveError = (function (_super) {
    __extends(ResolveError, _super);
    function ResolveError(key, innerErr) {
        var _this = _super.call(this, "Failed to resolve '" + key + "'.", innerErr) || this;
        Object.setPrototypeOf(_this, ResolveError.prototype);
        return _this;
    }
    return ResolveError;
}(nestedError_1.NestedError));
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

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TypeInferenceError = (function (_super) {
    __extends(TypeInferenceError, _super);
    function TypeInferenceError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, TypeInferenceError.prototype);
        return _this;
    }
    return TypeInferenceError;
}(Error));
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

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
function i(interfaceSymbol) {
    return function (target, parameterName, parameterIndex) {
        var paramTypes = Reflect.getMetadata('design:paramtypes', target);
        paramTypes[parameterIndex] = interfaceSymbol;
        Reflect.defineMetadata('design:paramtypes', paramTypes, target);
    };
}
exports.i = i;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./errors */ "./src/errors/index.ts"));
__export(__webpack_require__(/*! ./container */ "./src/container.ts"));
__export(__webpack_require__(/*! ./i */ "./src/i.ts"));
__export(__webpack_require__(/*! ./injectable */ "./src/injectable.ts"));
__export(__webpack_require__(/*! ./resolveOptions */ "./src/resolveOptions.ts"));


/***/ }),

/***/ "./src/injectable.ts":
/*!***************************!*\
  !*** ./src/injectable.ts ***!
  \***************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function injectable(constructor) {
}
exports.injectable = injectable;


/***/ }),

/***/ "./src/resolveOptions.ts":
/*!*******************************!*\
  !*** ./src/resolveOptions.ts ***!
  \*******************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ResolveOptions = (function () {
    function ResolveOptions(initial) {
        this.optionalParameters = false;
        this.constructUnregistered = true;
        this.params = {};
        Object.assign(this, initial);
    }
    return ResolveOptions;
}());
exports.ResolveOptions = ResolveOptions;


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