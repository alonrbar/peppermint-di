# peppermint-di

Dependency injection container for TypeScript and JavaScript.

[![npm version](https://img.shields.io/npm/v/peppermint-di.svg)](https://www.npmjs.com/package/peppermint-di)
[![npm license](https://img.shields.io/npm/l/peppermint-di.svg)](https://www.npmjs.com/package/peppermint-di)
[![CircleCI](https://circleci.com/gh/alonrbar/easy-template-x.svg?style=shield)](https://circleci.com/gh/alonrbar/easy-template-x)
[![dependencies](https://david-dm.org/alonrbar/peppermint-di.svg)](https://github.com/alonrbar/peppermint-di)

## Installation

```shell
yarn add peppermint-di
```

or

```shell
npm install --save peppermint-di
```

## The gist

```typescript
import { Container, injectable } from 'peppermint-di';

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

## Table of Content

- [Installation](#installation)
- [The gist](#the-gist)
- [Credits](#credits)
- [Examples](#examples)
  - [TypeScript](#typescript)
    - [Custom parameters](#custom-parameters)
    - [Interface registration](#interface-registration)
    - [Instance initializers](#instance-initializers)
  - [JavaScript](#javascript)
    - [Simple example](#simple-example)
    - [Custom parameters](#custom-parameters-1)
- [API](#api)
  - [The Container](#container)
  - [ResolveOptions](#resolveoptions)
- [Changelog](#changelog)

## Credits

This project was originally based on [this blog post](http://www.yusufaytas.com/dependency-injection-in-javascript/) by Yusuf Aytas as it appeared in [this StackOverflow question](https://stackoverflow.com/questions/20058391/javascript-SomeService-injection).  
The API is somewhat inspired by the excellent [Simple Injector](https://simpleinjector.readthedocs.io/en/latest/quickstart.html#introducing-simple-injector) C# library.

## Examples

### TypeScript

#### Custom parameters

```typescript
import { Container, injectable } from 'peppermint-di';

class SomeService {
    public name = 'default name';
}

@injectable
class MyClass {

    public myService: SomeService;

    constructor(myService: SomeService) {
        this.myService = myService;
    }
}

const container = new Container();

const customDep = new SomeService();
customDep.name = 'custom name';

const customParameters = new Map([
    [SomeService, customDep]
]);
const myClass = container.get(MyClass, { params: customParameters });

expect(myClass.myService).to.be.instanceOf(SomeService);
expect(myClass.myService.name).to.eql('custom name');
```

#### Interface registration

```typescript
import { Container, i, injectable } from 'peppermint-di';

//
// the interface
//

interface ISomeService {
}

const ISomeService = Symbol('ISomeService');

//
// the concrete type
//

class ConcreteSomeService implements ISomeService {
}

//
// the class to resolve
//

@injectable
class MyClass {

    public myService: ISomeService;

    constructor(@i(ISomeService) myService: ISomeService) {
        this.myService = myService;
    }
}

//
// test
//

const container = new Container();
container.register(ISomeService, ConcreteSomeService);

const myClass = container.get(MyClass);

expect(myClass).to.be.instanceOf(MyClass);
expect(myClass.myService).to.be.instanceOf(ConcreteSomeService);
```

#### Instance initializers

```typescript
import { Container, injectable } from 'peppermint-di';

class SomeService {
    public someFeatureFlag = false;
}

const container = new Container();

container.registerSingle(SomeService)
container.registerInitializer(SomeService, serviceInstance => {
    serviceInstance.someFeatureFlag = true;
});

const myService = container.get(SomeService);
expect(myService.someFeatureFlag).to.be.true;
```

### JavaScript

#### Simple example

```javascript
import { Container } from 'peppermint-di';

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

#### Custom parameters

```javascript
import { Container } from 'peppermint-di';

class SomeService {
    constructor() {
        this.name = 'default name';
    }
}

class MyClass {
    constructor(myService) {
        this.myService = myService;
    }
}

const container = new Container();

const customDep = new SomeService();
customDep.name = 'custom name';

const customParameters = new Map([
    ['myService', customDep]
]);
const myClass = container.get(MyClass, { params: customParameters });

expect(myClass.myService).to.be.instanceOf(SomeService);
expect(myClass.myService.name).to.eql('custom name');
```

## API

You can find here a brief overview of the Container API.  
For a more comprehensive review see the [typing file](https://github.com/alonrbar/peppermint-di/blob/master/dist/index.d.ts).  
You can also check out the library's [unit tests](https://github.com/alonrbar/peppermint-di/blob/master/test/container.tests.ts) as they contains examples for most use cases.

### Container

Container key type:

```typescript
type ContainerKey<T> = Constructor<T> | SimpleContainerKey;

type SimpleContainerKey = string | symbol;
```

Register a transient service.

```typescript
Container.register<T>(key: Constructor<T>, type?: Constructor<T>): void;

Container.register<T>(key: SimpleContainerKey, type: Constructor<T>): void;

Container.registerFactory<T>(key: ContainerKey<T>, factory: Factory<T>): void;
```

Register a singleton service.

```typescript
Container.registerSingle<T>(key: Constructor<T>, valueOrType?: T | Constructor<T>): void;

Container.registerSingle<T>(key: SimpleContainerKey, valueOrType: T | Constructor<T>): void;

Container.registerSingleFactory<T>(key: ContainerKey<T>, factory: Factory<T>): void;
```

Register an initializer.

```typescript
type Initializer<T> = (instance: T) => void;

Container.registerInitializer<T>(key: ContainerKey<T>, initializer: Initializer<T>): void
```

Get an instance of T.

```typescript
Container.get<T>(key: ContainerKey<T>, options?: ResolveOptions): T;
```

Resolve function arguments and call it.

```typescript
Container.call(foo: Function, thisArg?: any, options?: ResolveOptions): any;
```

### ResolveOptions

```typescript
class ResolveOptions {

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
```

## Changelog

The change log can be found [here](https://github.com/alonrbar/peppermint-di/blob/master/CHANGELOG.md).
