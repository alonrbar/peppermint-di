import 'reflect-metadata';
import { ResolveOptions } from './createOptions';
import { ResolveError, TypeInferenceError } from './errors';
import { Constructor, ContainerKey, Factory, IContainer } from './types';

// tslint:disable:ban-types

function emptyLogger(msg: string) {
    // noop
}

/**
 * A dependency injection container
 *
 * Based on: 
 * https://stackoverflow.com/questions/20058391/javascript-dependency-injection
 * http://www.yusufaytas.com/dependency-injection-in-javascript/
 */
export class Resolver implements IContainer {

    private static get canReflect(): boolean {
        if (Resolver._canReflect === undefined) {
            try {
                Resolver._canReflect = (Reflect && Reflect.construct) ? true : false;
            } catch (e) {
                Resolver._canReflect = false;
            }
        }
        return Resolver._canReflect;
    }
    private static _canReflect: boolean;    

    private readonly logger: (msg: string) => void;
    private readonly factories = new Map<ContainerKey<any>, Factory<any>>();
    private readonly potentialSingletons = new Map<ContainerKey<any>, Factory<any>>();
    private readonly singletons = new Map<ContainerKey<any>, any>();

    /**
     * @param logger Optional logger method. E.g. console.log.
     */
    constructor(logger?: (msg: string) => void) {
        this.logger = logger || emptyLogger;
    }

    // --- public methods --- //

    /**
     * Register a transient dependency.
     */
    public register<T>(key: ContainerKey<T>, factory?: Factory<T>): void {
        this.validateKey(key);

        const keyStr = this.getKeyString(key);

        if ((factory === null || factory === undefined) && typeof key === 'function') {
            this.logger(`Registering '${keyStr}' (constructor)`);
            this.factories.set(key, () => {
                return this.resolveCTor(key, null, null);
            });

        } else if (factory) {
            this.logger(`Registering '${keyStr}' (factory callback)`);
            this.factories.set(key, factory);

        } else {
            throw new Error(`Missing argument '${factory}'.`);
        }
    }

    /**
     * Register a singleton dependency.
     *
     * @param value Singleton object or a constructor function that will be
     * called once and it's result will be cached and re-served.
     */
    public registerSingle<T>(key: ContainerKey<T>, value?: T | Factory<T>): void {
        this.validateKey(key);

        const keyStr = this.getKeyString(key);

        if ((value === null || value === undefined) && typeof key === 'function') {
            this.logger(`Registering '${keyStr}' as singleton (constructor)`);
            this.potentialSingletons.set(key, () => {
                return this.resolveCTor(key, null, null);
            });

        } else if (typeof value === 'object') {
            this.logger(`Registering '${keyStr}' as singleton (value)`);
            this.singletons.set(key, value);

        } else if (typeof value === 'function') {
            this.logger(`Registering '${keyStr}' as singleton (factory callback)`);
            this.potentialSingletons.set(key, value);

        } else {
            throw new Error(`Invalid argument '${nameof(value)}'. Expected object or function.`);
        }
    }

    /**
     * Resolve registered dependencies. 
     * This method can also resolve non-registered dependencies by calling the supplied constructor function.
     *
     * @param {object} [params] The supplied parameters will be used directly instead of being resolved.
     */
    public get<T>(key: ContainerKey<T>, params?: any, options?: ResolveOptions): T {
        this.validateKey(key);
        return this.resolveSingleDependency<T>(key, params, options);
    }

    /**
     * Resolve function arguments and call it.
     * 
     * @param {object} [params] The supplied parameters will be used directly instead of being resolved
     */
    public call(foo: Function, thisArg?: any, params?: any, options?: ResolveOptions): any {
        const dependencies = this.resolveDependencies(foo, params, options);
        return foo.apply(thisArg, dependencies);
    }

    // --- private methods --- //

    private validateKey(key: ContainerKey<any>): void {
        if (typeof key !== 'string' && typeof key !== 'function' && typeof key !== 'symbol')
            throw new Error(`Invalid argument '${nameof(key)}'. Expected string, symbol or function. Received: ${JSON.stringify(key)}.`);
    }

    private getKeyString(key: ContainerKey<any>): string {
        if (typeof key === 'string')
            return key;
        if (typeof key === 'function')
            return key.name;
        return key.toString();
    }

    /**
     * resolve dependency using:
     * 1. parameters supplied by caller
     * 2. registered factories
     * 3. registered singletons
     * 4. construct
     */
    private resolveSingleDependency<T>(key: ContainerKey<T>, params: any, options: ResolveOptions): T {
        const keyStr = this.getKeyString(key);
        params = params || {};
        options = new ResolveOptions(options);

        // from params
        const fromParams = params[keyStr];
        if (fromParams !== undefined) {
            this.logger(`Resolving '${keyStr}' from params`);
            return fromParams;
        }

        // from factories
        const factory = this.factories.get(key);
        if (factory !== undefined) {
            this.logger(`Resolving '${keyStr}' from internal registry`);
            return this.resolveFactory(key, factory);
        }

        // from singletons
        const singleton = this.singletons.get(key);
        if (singleton !== undefined) {
            this.logger(`Resolving '${keyStr}' from internal registry (singleton)`);
            return singleton;
        }

        // from singleton factories
        const singletonFactory = this.potentialSingletons.get(key);
        if (singletonFactory !== undefined) {
            this.logger(`Resolving '${keyStr}' from internal registry (singleton factory)`);
            return this.resolveSingletonFactory(key, singletonFactory);
        }

        // dependency not registered...

        // construct
        if (options.constructUnregistered && typeof key === 'function') {
            this.logger(`Resolving '${keyStr}' by invoking as constructor`);
            return this.resolveCTor(key, params, options);
        }

        // treat as optional parameter
        if (options.optionalParameters) {
            this.logger(`Resolving '${keyStr}' as optional parameter (undefined)`);
            return undefined;
        }

        throw new ResolveError(keyStr, new Error('Dependency is not registered.'));
    }

    private resolveFactory<T>(key: ContainerKey<T>, factory: Factory<T>): T {
        try {
            return factory();
        } catch (e) {
            const keyStr = this.getKeyString(key);
            throw new ResolveError(keyStr, e);
        }
    }

    private resolveSingletonFactory<T>(key: ContainerKey<T>, singletonFactory: Factory<T>): T {
        const keyStr = this.getKeyString(key);

        // create the singleton
        let singleton;
        try {
            singleton = singletonFactory();
        } catch (e) {
            throw new ResolveError(keyStr, e);
        }

        // cache it
        try {
            this.singletons.set(key, singleton);
        } catch (e) {
            throw new ResolveError(keyStr, e);
        }

        // delete the singleton factory
        this.potentialSingletons.delete(key);

        return singleton;
    }

    private resolveCTor<T>(ctor: Constructor<T>, params: any, options: ResolveOptions): T {
        const dependencies = this.resolveDependencies(ctor, params, options);

        if (Resolver.canReflect) {
            return Reflect.construct(ctor, dependencies);

        } else {

            // a workaround to allow calling a constructor through .apply
            // see: http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
            // tslint:disable-next-line:variable-name
            const MiddlemanCTor = function (this: any) {
                ctor.apply(this, dependencies);
            };

            MiddlemanCTor.prototype = ctor.prototype;

            return new (MiddlemanCTor as any)();
        }
    }

    private resolveDependencies(func: Function, params: any, options: ResolveOptions): any[] {
        if (typeof func !== 'function')
            throw new Error(`Invalid argument '${nameof(func)}'. Expected function.`);

        const args = this.getArgumentKeys(func);

        const dependencies: any[] = [];
        for (const argKey of args) {

            let dependency: any;
            try {
                dependency = this.resolveSingleDependency(argKey, params, options);
            } catch (e) {
                throw new ResolveError(func.name || '<anonymous>', e);
            }

            dependencies.push(dependency);
        }
        return dependencies;
    }

    private getArgumentKeys(func: Function): any[] {

        const argNames = this.getArgumentNames(func);
        const argTypes = this.getArgumentTypes(func);

        // no type information
        if (!argTypes || !argTypes.length)
            return argNames;

        // mismatch length - unknown error
        if (argNames.length !== argTypes.length)
            throw new Error('Failed reflecting function arguments.');

        // fill missing type info by using argument name
        const args = argTypes.map((type, index) => {

            if (!type)
                throw new TypeInferenceError(`Can not infer type of argument in index ${index} of the function '${func.name}'.`);

            // primitives are never registered as dependency...
            if (type.name !== 'Object' && type.name !== 'String')
                return type;

            return argNames[index];
        });

        // log
        const argsStr = args.map(arg => {
            if (typeof arg === 'function')
                return arg.name;
            return arg;
        });
        this.logger(`Arguments of '${func.name}': ${JSON.stringify(argsStr)}`);

        // return
        return args;
    }

    private getArgumentNames(func: Function): string[] {

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

        args = args.split(',')
            .map(str => str.trim())
            .filter(arg => arg !== '');

        return args;
    }

    private getArgumentTypes(func: Function): Function[] {

        if (Resolver.canReflect) {

            // https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
            return Reflect.getMetadata('design:paramtypes', func);
        }

        return [];
    }
}