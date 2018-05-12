import { NestedError } from './nestedError';

class ResolveError extends NestedError {

    constructor(key: string, innerErr: Error) {
        super(`Failed to resolve '${key}'.`, innerErr);

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, ResolveError.prototype);
    }

}

export { ResolveError };