
//
// container
//

/**
 * A dependency injection container
 */
export class Container {

    /**
     * @param logger Optional logger method. E.g. console.log.
     */
    constructor(logger?: (msg: string) => void);

    /**
     * Register a transient dependency.
     * 
     * @param key The type to register.
     * @param type Optional. Concrete type to return instead of the 'key' parameter.
     */
    register<T>(key: Constructor<T>, type?: Constructor<T>): void;
    
    /**
     * Register a transient dependency.
     * 
     * @param key String (for JavaScript) or symbol (for TypeScript interfaces).
     * @param type The type to register.
     */
    register<T>(key: SimpleContainerKey, type: Constructor<T>): void;

    /**
     * Register a transient dependency.
     */
    registerFactory<T>(key: ContainerKey<T>, factory: Factory<T>): void;

    /**
     * Register a singleton dependency.
     *
     * @param key The type to register.
     * @param valueOrType Singleton object or a constructor function that will be
     * called once and it's result will be cached and re-served.
     */
    registerSingle<T>(key: Constructor<T>, valueOrType?: T | Constructor<T>): void;

    /**
     * Register a singleton dependency.
     *
     * @param key String (for JavaScript) or symbol (for TypeScript interfaces).
     * @param valueOrType Singleton object or a constructor function that will be
     * called once and it's result will be cached and re-served.
     */
    registerSingle<T>(key: SimpleContainerKey, valueOrType: T | Constructor<T>): void;

    /**
     * Register a singleton dependency.
     */
    registerSingleFactory<T>(key: ContainerKey<T>, factory: Factory<T>): void;

    /**
     * Register an initializer to be invoked each time a new instance of T is
     * created by the container.
     */
    registerInitializer<T>(key: ContainerKey<T>, initializer: Initializer<T>): void

    /**
     * Get an instance of T.
     */
    get<T>(key: ContainerKey<T>, options?: ResolveOptions): T;

    /**
     * Resolve function arguments and call it.
     */
    call(foo: Function, thisArg?: any, options?: ResolveOptions): any;
}

//
// types
//

export interface Constructor<T> {
    new(...args: any[]): T;
}

export declare type Factory<T> = () => T;

export declare type Initializer<T> = (instance: T) => void;

export declare type ContainerKey<T> = Constructor<T> | SimpleContainerKey;

export declare type SimpleContainerKey = string | symbol;

//
// options
//

export class ResolveOptions {

    /**
     * If set to 'true' will treat unregistered dependencies as optional
     * parameters and set their value to undefined.
     * 
     * Default value: false
     */
    optionalParameters?: boolean;

    /**
     * Set to 'false' if you don't want the injector to automatically try to
     * construct unregistered constructors.
     *
     * Default value: true
     */
    constructUnregistered?: boolean;

    /**
     * Parameters specified here will be used directly instead of being resolved.
     */
    params?: Map<ContainerKey<any>, any>;
}

//
// decorators
//

/**
 * Class decorator.
 * 
 * Indicates that the decorated class can have it's constructor parameters injected.
 */
export function injectable(constructor: Function): void;

/**
 * Parameter decorator.
 * 
 * Declare the interface type of a parameter.
 *
 * Example:
 * 
 * class MyClass {
 *    constructor(@i(IMyService) myService: IMyService) {
 *      ...
 *    }
 * }
 */
export function i(interfaceSymbol: symbol): ParameterDecorator;

//
// errors
//

/**
 * An Error that preserves inner Error's stack trace
 */
export class NestedError extends Error {
    constructor(message: string, innerError?: Error);
}

/**
 * Thrown when a 'resolve' call fails.
 */
export class ResolveError extends NestedError {
    constructor(key: string, innerErr: Error);
}

/**
 * Thrown when an attempt to infer the type of a parameter fails.
 */
export class TypeInferenceError extends Error {
    constructor(message?: string);
}