export class ResolveOptions {

    /**
     * If set to 'true' will treat unregistered dependencies as optional
     * parameters and set their value to undefined.
     * 
     * Default value: false
     */
    public optionalParameters? = false;
    
    /**
     * Set to 'false' if you don't want the injector to automatically try to
     * construct unregistered constructors.
     *
     * Default value: true
     */
    public constructUnregistered? = true;

    constructor(initial?: Partial<ResolveOptions>) {
        Object.assign(this, initial);
    }
}