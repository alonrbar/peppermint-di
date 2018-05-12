import "reflect-metadata";

/**
 * Declare the interface type of a parameter.
 *
 * Example:
 * 
 * class MyClass {
 *    constructor(@i(IMyService) myService: IMyService) {
 *      ...
 *    }
 * }
 * 
 * To see more about how or why it works read here:
 * https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
export function i(interfaceSymbol: symbol): ParameterDecorator {
    return (target: object, parameterName: string | symbol, parameterIndex: number) => {
        const paramTypes = Reflect.getMetadata('design:paramtypes', target);
        paramTypes[parameterIndex] = interfaceSymbol;
        Reflect.defineMetadata('design:paramtypes', paramTypes, target);
    };
}