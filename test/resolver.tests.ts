import { expect } from 'chai';
import { Resolver } from 'src';

describe(nameof(Resolver), () => {

    describe('constructor', () => {

        it('works without arguments', () => {
            const resolver = new Resolver();
            expect(resolver).to.exist;
        });


        it('calculates 1 + 1', () => {
            expect(1 + 1).to.eql(2);
        });

    });

});