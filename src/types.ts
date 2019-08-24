
export interface Constructor<T> {
    new(...args: any[]): T;
}

export type Factory<T> = () => T;

export type Initializer<T> = (instance: T) => void;

export type ContainerKey<T> = Constructor<T> | SimpleContainerKey;

export type SimpleContainerKey = string | symbol;