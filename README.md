# resolver-js
Dependency injection container for TypeScript and JavaScript.

This project was originally based on [this blog post](http://www.yusufaytas.com/dependency-injection-in-javascript/) by Yusuf Aytas as it appeared in [this StackOverflow question](https://stackoverflow.com/questions/20058391/javascript-dependency-injection).  
It has since evolved to support singleton registration, optional parameters, TypeScript support and more.

## Installation

```shell
yarn add resolver-js
```

or

```shell
npm install --save resolver-js
```

## Short Example - TypeScript

```javascript
class SomeService {
    // ...
}

class SomeClass {
    constructor(someService: SomeService) {
        // ...
    }
}


const resolver = new Resolver();

resolver.registerSingle(SomeService)

const myClass = resolver.get(SomeClass);
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


const resolver = new Resolver();

resolver.registerSingle('someService', SomeService);

const myClass = resolver.get(SomeClass);
```

## API

Currently the readme includes only a brief overview of the Resolver API. For a more comprehensive review see the [typing file](https://github.com/alonrbar/resolver-js/blob/master/dist/index.d.ts).

Register a transient dependency.

```javascript
Resolver.register<T>(key: ContainerKey<T>, factory?: Factory<T>): void;
```

Register a singleton dependency.

```javascript
Resolver.registerSingle<T>(key: ContainerKey<T>, value?: T | Factory<T>): void;
```

Resolve registered dependencies.

```javascript
Resolver.get<T>(key: ContainerKey<T> | string, params?: any, options?: ResolveOptions): T;
```

Resolve a function arguments and call it.

```javascript
Resolver.call(foo: Function, thisArg?: any, params?: any, options?: ResolveOptions): any;
```
