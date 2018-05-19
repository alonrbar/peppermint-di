import { expect } from 'chai';
import { Container, injectable } from 'src';

// tslint:disable:no-unused-expression

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

    });

});