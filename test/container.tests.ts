import { expect } from 'chai';
import { Container, i, injectable, ResolveError, ResolveOptions } from 'src';

// tslint:disable:no-unused-expression object-literal-key-quotes

describe(nameof(Container), () => {

    describe('constructor', () => {

        it('does not throw when called with no arguments', () => {
            const container = new Container();
            expect(container).to.exist;
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
            expect(myClass.dep).to.be.instanceOf(Dependency);
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
            expect(myClass.dep).to.be.instanceOf(Dependency);
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

                const myClass = container.get(MyClass, { params: { [nameof(Dependency)]: customDep } });
                expect(myClass.dep).to.be.instanceOf(Dependency);
                expect(myClass.dep.name).to.eql('custom name');
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

                const myClass = container.get(MyClass, { params: { 'dep': customDep } });
                expect(myClass.dep).to.be.instanceOf(Dependency);
                expect(myClass.dep.name).to.eql('custom name');
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

                expect(() => container.get(MyClass)).to.throw(Error);
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
                expect(myClass.dep).to.be.instanceOf(Dependency);
                expect(myClass.dep.name).to.eql('default name');
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
                expect(myClass.dep).to.be.instanceOf(Dependency);
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

                expect(() => container.get(MyClass, { constructUnregistered: false })).to.throw(ResolveError);                
            });

        });
    });

    describe(nameof(Container.prototype.register), () => {

        it('registers a dependency by string key', () => {

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
            expect(myClass.myDependency).to.be.instanceOf(Dependency);
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

            expect(myClass1).to.not.equal(myClass2);
            expect(myClass1.dep).to.be.instanceOf(Dependency);
            expect(myClass2.dep).to.be.instanceOf(Dependency);
            expect(myClass1.dep).to.not.equal(myClass2.dep);
        });

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

            expect(myClass1).to.not.equal(myClass2);
            expect(myClass1.dep).to.not.equal(myClass2.dep);
            expect(myClass1.dep).to.be.instanceOf(Dependency);
            expect(myClass2.dep).to.be.instanceOf(Dependency);
            expect(callCount).to.eql(2);
        });

        it('registers a singleton instance', () => {

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

            expect(myClass1).to.not.equal(myClass2);
            expect(myClass1.dep).to.equal(myClass2.dep);
            expect(myClass1.dep).to.equal(myDep);
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

            expect(myClass1).to.not.equal(myClass2);
            expect(myClass1.dep).to.equal(myClass2.dep);
            expect(myClass1.dep).to.be.instanceOf(Dependency);
        });        

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

            expect(myClass1).to.not.equal(myClass2);
            expect(myClass1.dep).to.equal(myClass2.dep);
            expect(myClass1.dep).to.be.instanceOf(Dependency);
            expect(callCount).to.eql(1);
        });

        it('registers an interface implementation', () => {

            //
            // the interface
            //

            interface IDependency {
            }
            
            const IDependency = Symbol('IDependency');  // tslint:disable-line:variable-name

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
            expect(myClass).to.be.instanceOf(MyClass);
            expect(myClass.dep).to.be.instanceOf(ConcreteDependency);
        });

    });

});