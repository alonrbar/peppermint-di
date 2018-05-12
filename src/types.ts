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