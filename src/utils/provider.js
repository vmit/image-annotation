
/**
 * Basic provider for data that is "ready later".
 */
export default class Provider {

    /**
     * @param {function} providerFn data factory
     */
    constructor(providerFn) {
        this._providerFn = providerFn;
    }

    /**
     * @return {*} value returned from providerFn
     */
    get() {
        return this._providerFn()
    }
}