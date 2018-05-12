import { expect } from 'chai';
import { Container, injectable } from 'src';

describe(nameof(Container), () => {

    describe('constructor', () => {

        it('works without arguments', () => {
            const resolver = new Container();
            expect(resolver).to.exist;
        });

    });

    describe(nameof(Container.prototype.get), () => {

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

            const resolver = new Container();
            resolver.register(Dependency);

            const myClass = resolver.get(MyClass);
            expect(myClass.dep).to.be.instanceOf(Dependency);;
        });

    });

});