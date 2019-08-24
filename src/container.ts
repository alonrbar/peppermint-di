import 'reflect-metadata';
import { ResolveError, TypeInferenceError } from './errors';
import { ResolveOptions } from './resolveOptions';
import { Constructor, ContainerKey, Factory, Initializer, SimpleContainerKey } from './types';
const defaultsDeep = require('lodash.defaultsdeep');

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
export class Container {

    private static get canReflect(): boolean {
        if (Container._canReflect === undefined) {
            try {
                Container._canReflect = (Reflect && Reflect.construct) ? true : false;
            } catch (e) {
                Container._canReflect = false;
            }
        }
        return Container._canReflect;
    }
    private static _canReflect: boolean;

    private readonly logger: (msg: string) => void;
    private readonly factories = new Map<ContainerKey<any>, Factory<any>>();
    private readonly initializers = new Map<ContainerKey<any>, Initializer<any>[]>();
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
     * 
     * @param key The type to register.
     * @param type Optional. Concrete type to return instead of the 'key' parameter.
     */
    public register<T>(key: Constructor<T>, type?: Constructor<T>): void;
    /**
     * Register a transient dependency.
     * 
     * @param key String (for JavaScript) or symbol (for TypeScript interfaces).
     * @param type The type to register.
     */
    public register<T>(key: SimpleContainerKey, type: Constructor<T>): void;
    public register<T>(key: ContainerKey<T>, type?: Constructor<T>): void {
        this.validateKey(key);

        const keyStr = this.getKeyString(key);

        // key is constructor
        if ((type === null || type === undefined) && typeof key === 'function') {

            this.logger(`Registering '${keyStr}' (${nameof(key)} as constructor)`);
            this.factories.set(key, () => {
                return this.resolveCTor(key, null);
            });

        } else if (type) {

            if (typeof type !== 'function')
                throw new Error(`Invalid argument '${nameof(type)}'. Constructor function expected.`);

            // key is primitive or "interface type", type is concrete type
            this.logger(`Registering '${keyStr}' (${nameof(type)} as constructor)`);
            this.factories.set(key, () => {
                return this.resolveCTor(type, null);
            });

        } else {
            throw new Error(`Missing argument '${nameof(type)}'.`);
        }
    }

    /**
     * Register a transient dependency.
     */
    public registerFactory<T>(key: ContainerKey<T>, factory: Factory<T>): void {
        this.validateKey(key);

        if (typeof factory !== 'function')
            throw new Error(`Invalid argument '${nameof(factory)}'. Factory function expected.`);

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
    public registerSingle<T>(key: Constructor<T>, value?: T | Constructor<T>): void;
    /**
     * Register a singleton dependency.
     *
     * @param key String (for JavaScript) or symbol (for TypeScript interfaces).
     * @param value Singleton object or a constructor function that will be
     * called once and it's result will be cached and re-served.
     */
    public registerSingle<T>(key: SimpleContainerKey, value: T | Constructor<T>): void;
    public registerSingle<T>(key: ContainerKey<T>, value?: T | Constructor<T>): void {
        this.validateKey(key);

        const keyStr = this.getKeyString(key);

        if ((value === null || value === undefined) && typeof key === 'function') {
            this.logger(`Registering '${keyStr}' as singleton (${nameof(key)} as constructor)`);
            this.potentialSingletons.set(key, () => {
                return this.resolveCTor(key, null);
            });

        } else if (typeof value === 'object') {
            this.logger(`Registering '${keyStr}' as singleton (value as instance)`);
            this.singletons.set(key, value);

        } else if (typeof value === 'function') {
            this.logger(`Registering '${keyStr}' as singleton (value as constructor)`);
            this.potentialSingletons.set(key, () => {
                return this.resolveCTor(value as Constructor<T>, null);
            });

        } else {
            throw new Error(`Invalid argument '${nameof(value)}'. Expected object or function.`);
        }
    }

    /**
     * Register a singleton dependency.
     */
    public registerSingleFactory<T>(key: ContainerKey<T>, factory: Factory<T>): void {
        this.validateKey(key);

        if (typeof factory !== 'function')
            throw new Error(`Invalid argument '${nameof(factory)}'. Factory function expected.`);

        const keyStr = this.getKeyString(key);
        this.logger(`Registering '${keyStr}' as singleton (factory callback)`);
        this.potentialSingletons.set(key, factory);
    }

    /**
     * Register an initializer to be invoked each time a new instance of T is
     * created by the container.
     */
    public registerInitializer<T>(key: ContainerKey<T>, initializer: Initializer<T>): void {
        this.validateKey(key);

        if (typeof initializer !== 'function')
            throw new Error(`Invalid argument '${nameof(initializer)}'. Initializer function expected.`);

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
    public get<T>(key: ContainerKey<T>, options?: ResolveOptions): T {
        this.validateKey(key);
        return this.resolveSingleDependency<T>(key, options);
    }

    /**
     * Resolve function arguments and call it.
     */
    public call(foo: Function, thisArg?: any, options?: ResolveOptions): any {
        const dependencies = this.resolveDependencies(foo, options);
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
    private resolveSingleDependency<T>(key: ContainerKey<T>, options: ResolveOptions): T {
        const keyStr = this.getKeyString(key);
        options = defaultsDeep(options, new ResolveOptions());

        // from params
        if (options.params) {
            const fromParams = options.params.get(key);
            if (fromParams !== undefined) {
                this.logger(`Resolving '${keyStr}' from params`);
                return fromParams;
            }
        }

        // from factories
        const factory = this.factories.get(key);
        if (factory !== undefined) {
            this.logger(`Resolving '${keyStr}' from internal registry`);
            const instance = this.resolveFactory(key, factory);
            this.initializeInstance(key, instance);
            return instance;
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
            const instance = this.resolveCTor(key, options);
            this.initializeInstance(key, instance);
            return instance;
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

        // initialize the singleton instance
        this.initializeInstance(key, singleton);

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

    private resolveCTor<T>(ctor: Constructor<T>, options: ResolveOptions): T {
        const dependencies = this.resolveDependencies(ctor, options);

        if (Container.canReflect) {
            return Reflect.construct(ctor, dependencies);

        } else {

            // a workaround to allow calling a constructor through .apply
            // see: http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
            const MiddlemanCTor = function (this: any) {
                ctor.apply(this, dependencies);
            };

            MiddlemanCTor.prototype = ctor.prototype;

            return new (MiddlemanCTor as any)();
        }
    }

    private initializeInstance<T>(key: ContainerKey<T>, instance: T): void {
        const initializersList = this.initializers.get(key);
        if (!initializersList)
            return;

        for (const initializer of initializersList) {
            initializer(instance);
        }
    }

    private resolveDependencies(func: Function, options: ResolveOptions): any[] {
        if (typeof func !== 'function')
            throw new Error(`Invalid argument '${nameof(func)}'. Expected function.`);

        const args = this.getArgumentKeys(func);

        const dependencies: any[] = [];
        for (const argKey of args) {

            let dependency: any;
            try {
                dependency = this.resolveSingleDependency(argKey, options);
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

        if (Container.canReflect) {

            // https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
            return Reflect.getMetadata('design:paramtypes', func);
        }

        return [];
    }
}