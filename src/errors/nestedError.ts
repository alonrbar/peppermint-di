/**
 * An Error that preserves inner Error's stack trace
 */
export class NestedError extends Error {

    private static createStack(myStack: string, innerError?: Error): string {

        if (!innerError)
            return myStack;

        myStack += '\n------------------------------------------------\n';
        myStack += 'Inner Error: ';

        if (innerError instanceof Error) {
            myStack += innerError.stack;
        } else {
            myStack += (innerError as any).toString();
        }

        return myStack;
    }

    constructor(message: string, innerError?: Error) {
        super(message);

        this.stack = NestedError.createStack(this.stack, innerError);

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, NestedError.prototype);
    }
}