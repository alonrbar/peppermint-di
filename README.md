# peppermint-di

SomeService injection container for TypeScript and JavaScript.

This project was originally based on [this blog post](http://www.yusufaytas.com/SomeService-injection-in-javascript/) by Yusuf Aytas as it appeared in [this StackOverflow question](https://stackoverflow.com/questions/20058391/javascript-SomeService-injection).  
It has since evolved to support:

- TypeScript
- Singleton registration
- Interface registration
- Optional parameters
- and more...

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

## Short Example - JavaScript

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

## More Examples

### Interface Registration - TypeScript

```javascript
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

### Custom parameters - TypeScript

```javascript
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

const customParameters = { [SomeService.constructor.name]: customDep };
const myClass = container.get(MyClass, { params: customParameters });

expect(myClass.myService).to.be.instanceOf(SomeService);
expect(myClass.myService.name).to.eql('custom name');
```

### Custom parameters - JavaScript

```javascript
import { Container } from 'peppermint-di';

class SomeService {
    public name = 'default name';
}

class MyClass {

    public myService: SomeService;

    constructor(myService: SomeService) {
        this.myService = myService;
    }
}

const container = new Container();

const customDep = new SomeService();
customDep.name = 'custom name';

const customParameters = { 'myService': customDep };
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

```javascript
type ContainerKey<T> = Constructor<T> | SimpleContainerKey;

type SimpleContainerKey = string | symbol;
```

Register a transient SomeService.

```javascript
Container.register<T>(key: Constructor<T>, type?: Constructor<T>): void;

Container.register<T>(key: SimpleContainerKey, type: Constructor<T>): void;

Container.registerFactory<T>(key: ContainerKey<T>, factory: Factory<T>): void;
```

Register a singleton SomeService.

```javascript
Container.registerSingle<T>(key: Constructor<T>, valueOrType?: T | Constructor<T>): void;

Container.registerSingle<T>(key: SimpleContainerKey, valueOrType: T | Constructor<T>): void;

Container.registerSingleFactory<T>(key: ContainerKey<T>, factory: Factory<T>): void;
```

Get an instance of T.

```javascript
Container.get<T>(key: ContainerKey<T>, options?: ResolveOptions): T;
```

Resolve function arguments and call it.

```javascript
Container.call(foo: Function, thisArg?: any, options?: ResolveOptions): any;
```

### ResolveOptions

```javascript
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
    params?: IDictionary<any>;
}
```

## Changelog

The change log can be found [here](https://github.com/alonrbar/redux-app/blob/master/CHANGELOG.md).