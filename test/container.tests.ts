import { Container, i, injectable, ResolveError, ResolveOptions } from 'src';

describe(nameof(Container), () => {

    describe('constructor', () => {

        it('does not throw when called with no arguments', () => {
            const container = new Container();
            expect(container).not.toBeFalsy();
        });

    });

    describe(nameof(Container.prototype.get), () => {

        it('resolves constructor with registered dependency', () => {

            class Dependency {

            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency) {
                    this.dep = dep;
                }
            }

            const container = new Container();
            container.register(Dependency);

            const myClass = container.get(MyClass);
            expect(myClass.dep).toBeInstanceOf(Dependency);
        });

        it('resolves constructor with no registered dependency', () => {

            class Dependency {

            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency) {
                    this.dep = dep;
                }
            }

            const container = new Container();

            const myClass = container.get(MyClass);
            expect(myClass.dep).toBeInstanceOf(Dependency);
        });

        describe(nameof(ResolveOptions), () => {

            it('uses dependencies from params (typescript)', () => {

                class Dependency {
                    public name = 'default name';
                }

                @injectable
                class MyClass {

                    public dep: Dependency;

                    constructor(dep: Dependency) {
                        this.dep = dep;
                    }
                }

                const container = new Container();

                const customDep = new Dependency();
                customDep.name = 'custom name';

                const params = new Map([
                    [Dependency, customDep]
                ]);
                const myClass = container.get(MyClass, { params });
                expect(myClass.dep).toBeInstanceOf(Dependency);
                expect(myClass.dep.name).toEqual('custom name');
                expect(myClass.dep).toBe(customDep);
            });

            it('uses dependencies from params (javascript)', () => {

                class Dependency {
                    public name = 'default name';
                }

                class MyClass {

                    public dep: Dependency;

                    constructor(dep: Dependency) {
                        this.dep = dep;
                    }
                }

                const container = new Container();

                const customDep = new Dependency();
                customDep.name = 'custom name';

                const params = new Map([
                    ['dep', customDep]
                ]);
                const myClass = container.get(MyClass, { params });
                expect(myClass.dep).toBeInstanceOf(Dependency);
                expect(myClass.dep.name).toEqual('custom name');
            });

            it('does not throw on empty params map', () => {

                class Dependency {
                    public name = 'default name';
                }

                @injectable
                class MyClass {

                    public dep: Dependency;

                    constructor(dep: Dependency) {
                        this.dep = dep;
                    }
                }

                const container = new Container();

                const params = new Map();
                const myClass = container.get(MyClass, { params });
                expect(myClass.dep).toBeInstanceOf(Dependency);
                expect(myClass.dep.name).toEqual('default name');
            });

            it(`throws on missing parameters when ${nameof(ResolveOptions.prototype.optionalParameters)} is not specified`, () => {

                class Dependency {
                    public name = 'default name';

                    constructor(name?: string) {
                        if (name)
                            this.name = name;
                    }
                }

                @injectable
                class MyClass {

                    public dep: Dependency;

                    constructor(dep: Dependency) {
                        this.dep = dep;
                    }
                }

                const container = new Container();

                expect(() => container.get(MyClass)).toThrow();
            });

            it(`allows optional parameters when ${nameof(ResolveOptions.prototype.optionalParameters)} is true`, () => {

                class Dependency {
                    public name = 'default name';

                    constructor(name?: string) {
                        if (name)
                            this.name = name;
                    }
                }

                @injectable
                class MyClass {

                    public dep: Dependency;

                    constructor(dep: Dependency) {
                        this.dep = dep;
                    }
                }

                const container = new Container();

                const myClass = container.get(MyClass, { optionalParameters: true });
                expect(myClass.dep).toBeInstanceOf(Dependency);
                expect(myClass.dep.name).toEqual('default name');
            });

            it(`automatically resolves missing typed dependencies when ${nameof(ResolveOptions.prototype.constructUnregistered)} is not specified`, () => {

                class Dependency {
                }

                @injectable
                class MyClass {

                    public dep: Dependency;

                    constructor(dep: Dependency) {
                        this.dep = dep;
                    }
                }

                const container = new Container();

                const myClass = container.get(MyClass);
                expect(myClass.dep).toBeInstanceOf(Dependency);
            });

            it(`throws on missing typed dependencies when ${nameof(ResolveOptions.prototype.constructUnregistered)} is false`, () => {

                class Dependency {
                }

                @injectable
                class MyClass {

                    public dep: Dependency;

                    constructor(dep: Dependency) {
                        this.dep = dep;
                    }
                }

                const container = new Container();

                expect(() => container.get(MyClass, { constructUnregistered: false })).toThrow(ResolveError);
            });

        });
    });

    describe(nameof(Container.prototype.register), () => {

        it('registers a transient dependency by string key', () => {

            class Dependency {

            }

            class MyClass {

                public myDependency: Dependency;

                constructor(dep: Dependency) {
                    this.myDependency = dep;
                }
            }

            const container = new Container();
            container.register('dep', Dependency);

            const myClass = container.get(MyClass);
            expect(myClass.myDependency).toBeInstanceOf(Dependency);
        });

        it('registers a transient dependency by type', () => {

            class Dependency {
            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency) {
                    this.dep = dep;
                }
            }

            const container = new Container();
            container.register(Dependency);

            const myClass1 = container.get(MyClass);
            const myClass2 = container.get(MyClass);

            expect(myClass1).not.toBe(myClass2);
            expect(myClass1.dep).toBeInstanceOf(Dependency);
            expect(myClass2.dep).toBeInstanceOf(Dependency);
            expect(myClass1.dep).not.toBe(myClass2.dep);
        });

        it('registers an interface implementation', () => {

            //
            // the interface
            //

            interface IDependency {
            }

            const IDependency = Symbol('IDependency');

            //
            // the concrete type
            //

            class ConcreteDependency implements IDependency {
            }

            //
            // the class to resolve
            //

            @injectable
            class MyClass {

                public dep: IDependency;

                constructor(@i(IDependency) dep: IDependency) {
                    this.dep = dep;
                }
            }

            //
            // test
            //

            const container = new Container();
            container.register(IDependency, ConcreteDependency);

            const myClass = container.get(MyClass);
            expect(myClass).toBeInstanceOf(MyClass);
            expect(myClass.dep).toBeInstanceOf(ConcreteDependency);
        });

    });

    describe(nameof(Container.prototype.registerFactory), () => {

        it('registers a transient dependency by factory', () => {

            class Dependency {
            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency) {
                    this.dep = dep;
                }
            }

            const container = new Container();

            let callCount = 0;

            container.registerFactory(Dependency, () => {
                callCount++;
                return new Dependency();
            });

            const myClass1 = container.get(MyClass);
            const myClass2 = container.get(MyClass);

            expect(myClass1).not.toBe(myClass2);
            expect(myClass1.dep).not.toBe(myClass2.dep);
            expect(myClass1.dep).toBeInstanceOf(Dependency);
            expect(myClass2.dep).toBeInstanceOf(Dependency);
            expect(callCount).toEqual(2);
        });

    });

    describe(nameof(Container.prototype.registerSingle), () => {

        it('registers a singleton instance by value', () => {

            class Dependency {

            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency) {
                    this.dep = dep;
                }
            }

            const container = new Container();

            const myDep = new Dependency();

            container.registerSingle(Dependency, myDep);

            const myClass1 = container.get(MyClass);
            const myClass2 = container.get(MyClass);

            expect(myClass1).not.toBe(myClass2);
            expect(myClass1.dep).toBe(myClass2.dep);
            expect(myClass1.dep).toBe(myDep);
        });

        it('registers a singleton by type', () => {

            class Dependency {

            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency) {
                    this.dep = dep;
                }
            }

            const container = new Container();
            container.registerSingle(Dependency);

            const myClass1 = container.get(MyClass);
            const myClass2 = container.get(MyClass);

            expect(myClass1).not.toBe(myClass2);
            expect(myClass1.dep).toBe(myClass2.dep);
            expect(myClass1.dep).toBeInstanceOf(Dependency);
        });

    });

    describe(nameof(Container.prototype.registerSingleFactory), () => {

        it('registers a singleton by factory', () => {

            class Dependency {
            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency) {
                    this.dep = dep;
                }
            }

            const container = new Container();

            let callCount = 0;

            container.registerSingleFactory(Dependency, () => {
                callCount++;
                return new Dependency();
            });

            const myClass1 = container.get(MyClass);
            const myClass2 = container.get(MyClass);

            expect(myClass1).not.toBe(myClass2);
            expect(myClass1.dep).toBe(myClass2.dep);
            expect(myClass1.dep).toBeInstanceOf(Dependency);
            expect(callCount).toEqual(1);
        });

    });

    describe(nameof(Container.prototype.registerInitializer), () => {

        it('initializer is invoked for each created instance', () => {

            class Dependency {
                public name: string;
            }

            const container = new Container();

            container.register(Dependency);

            let initializedInstances = 0;
            container.registerInitializer(Dependency, dep => {
                dep.name = 'initialized_' + (initializedInstances++);
            });

            const dep1 = container.get(Dependency);
            const dep2 = container.get(Dependency);

            expect(initializedInstances).toEqual(2);
            expect(dep1.name).toEqual('initialized_0');
            expect(dep2.name).toEqual('initialized_1');
        });

        it('initializer is not invoked for params', () => {

            class Dependency {
                public name: string;
            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency) {
                    this.dep = dep;
                }
            }

            const container = new Container();

            container.register(Dependency);

            let initializedInstances = 0;
            container.registerInitializer(Dependency, dep => {
                dep.name = 'initialized_' + (initializedInstances++);
            });

            const customDep = new Dependency();
            customDep.name = 'custom name';

            const params = new Map([
                [Dependency, customDep]
            ]);
            const myClass = container.get(MyClass, { params });

            expect(initializedInstances).toEqual(0);
            expect(myClass.dep.name).toEqual('custom name');
        });

        it('initializer is invoked only once for singletons', () => {

            class Dependency {
                public name: string;
            }

            const container = new Container();

            container.registerSingle(Dependency);

            let initializedInstances = 0;
            container.registerInitializer(Dependency, dep => {
                dep.name = 'initialized_' + (initializedInstances++);
            });

            const dep1 = container.get(Dependency);
            const dep2 = container.get(Dependency);
            const dep3 = container.get(Dependency);

            expect(initializedInstances).toEqual(1);
            expect(dep1.name).toEqual('initialized_0');
            expect(dep2.name).toEqual('initialized_0');
            expect(dep3.name).toEqual('initialized_0');
        });

        it('multiple initializers are always invoked in order', () => {

            class Dependency {
                public num: number;
            }

            const container = new Container();

            container.register(Dependency);

            container.registerInitializer(Dependency, dep => {
                dep.num = 0;
            });

            container.registerInitializer(Dependency, dep => {
                dep.num += 5;
            });

            container.registerInitializer(Dependency, dep => {
                dep.num *= 3;
            });

            container.registerInitializer(Dependency, dep => {
                dep.num -= 4;
            });

            for (let count = 0; count < 10; count++) {
                const myDep = container.get(Dependency);
                expect(myDep.num).toEqual(11);
            }
        });

    });

});