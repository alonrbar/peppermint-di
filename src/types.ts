
// tslint:disable-next-line:interface-name
export interface Constructor<T> {
    new(...args: any[]): T;
}

export interface IDictionary<T> {
    [key: string]: T;
}

export type Factory<T> = () => T;

export type ContainerKey<T> = Constructor<T> | SimpleContainerKey;

export type SimpleContainerKey = string | symbol;

export type Initializer<T> = (instance: T) => void;
