import { expect } from 'chai';
import { Resolver, injectable } from 'src';

describe(nameof(Resolver), () => {

    describe('constructor', () => {

        it('works without arguments', () => {
            const resolver = new Resolver();
            expect(resolver).to.exist;
        });

    });

    describe(nameof(Resolver.prototype.get), () => {

        it('resolves constructor with registered dependency', () => {

            class Dependency {

            }

            @injectable
            class MyClass {

                public dep: Dependency;

                constructor(dep: Dependency ) {
                    this.dep = dep;
                }
            }

            const resolver = new Resolver();
            resolver.register(Dependency);

            const myClass = resolver.get(MyClass);
            expect(myClass.dep).to.be.instanceOf(Dependency);;
        });

    });

});