# peppermint-di

Dependency injection container for TypeScript and JavaScript.

This project was originally based on [this blog post](http://www.yusufaytas.com/dependency-injection-in-javascript/) by Yusuf Aytas as it appeared in [this StackOverflow question](https://stackoverflow.com/questions/20058391/javascript-dependency-injection).  
It has since evolved to support singleton registration, optional parameters, TypeScript support and more.

## Installation

```shell
yarn add peppermint-di
```

or

```shell
npm install --save peppermint-di
```

## Short Example - TypeScript

```javascript
class SomeService {
    // ...
}

@injectable
class SomeClass {
    constructor(someService: SomeService) {
        // ...
    }
}


const container = new Container();

container.registerSingle(SomeService)

const myClass = container.get(SomeClass);
```

## Short Example - JavaScript

```javascript
class SomeService {
    // ...
}

class SomeClass {
    constructor(someService) {
        // ...
    }
}


const container = new Container();

container.registerSingle('someService', SomeService);

const myClass = container.get(SomeClass);
```

## API

Currently the readme includes only a brief overview of the Container API. For a more comprehensive review see the [typing file](https://github.com/alonrbar/peppermint-di/blob/master/dist/index.d.ts).

Register a transient dependency.

```javascript
Container.register<T>(key: ContainerKey<T>, factory?: Factory<T>): void;
```

Register a singleton dependency.

```javascript
Container.registerSingle<T>(key: ContainerKey<T>, value?: T | Factory<T>): void;
```

Resolve registered dependencies.

```javascript
Container.get<T>(key: ContainerKey<T> | string, params?: any, options?: ResolveOptions): T;
```

Resolve function arguments and call it.

```javascript
Container.call(foo: Function, thisArg?: any, params?: any, options?: ResolveOptions): any;
```
