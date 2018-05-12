
//
// container
//

/**
 * A dependency injection container
 *
 * Based on: 
 * https://stackoverflow.com/questions/20058391/javascript-dependency-injection
 * http://www.yusufaytas.com/dependency-injection-in-javascript/
 */
export class Container implements IContainer {

    /**
     * @param logger Optional logger method. E.g. console.log.
     */
    constructor(logger?: (msg: string) => void);

    /**
     * Register a transient dependency.
     */
    public register<T>(key: ContainerKey<T>, factory?: Factory<T>): void;

    /**
     * Register a singleton dependency.
     *
     * @param value Singleton object or a constructor function that will be
     * called once and it's result will be cached and re-served.
     */
    public registerSingle<T>(key: ContainerKey<T>, value?: T | Factory<T>): void;

    /**
     * Resolve registered dependencies. 
     * This method can also resolve non-registered dependencies by calling the supplied constructor function.
     *
     * @param {object} [params] The supplied parameters will be used directly instead of being resolved.
     */
    public get<T>(key: ContainerKey<T>, params?: any, options?: ResolveOptions): T;

    /**
     * Resolve function arguments and call it.
     * 
     * @param {object} [params] The supplied parameters will be used directly instead of being resolved.
     */
    public call(foo: Function, thisArg?: any, params?: any, options?: ResolveOptions): any;
}

//
// types
//

export interface Constructor<T> {
    new(...args: any[]): T;
}

export declare type Factory<T> = () => T;

export declare type ContainerKey<T> = Constructor<T> | string | symbol;

export interface IResolver {
    get<T>(key: ContainerKey<T>, params?: any): T;
}

export interface IContainer extends IResolver {
    register<T>(key: ContainerKey<T>, factory?: Factory<T>): void;
    registerSingle<T>(key: ContainerKey<T>, value?: T | Factory<T>): void;
}

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
    public optionalParameters?: boolean;

    /**
     * Set to 'false' if you don't want the injector to automatically try to
     * construct unregistered constructors.
     *
     * Default value: true
     */
    public constructUnregistered?: boolean;

    constructor(initial?: Partial<ResolveOptions>);
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