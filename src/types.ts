
// tslint:disable-next-line:interface-name
export interface Constructor<T> {
    new(...args: any[]): T;
}

export interface IDictionary<T> {
    [key: string]: T;
}

export type Factory<T> = () => T;

export type ContainerKey<T> = Constructor<T> | PrimitiveContainerKey;

export type PrimitiveContainerKey = string | symbol;
