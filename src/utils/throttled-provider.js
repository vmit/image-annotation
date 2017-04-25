import Provider from './provider';

/**
 * Provider that limit frequency of calls to data factory.
 * Could be used as cache for heavily computed values in frequent calls (like "mousemove" handler).
 */
export default class ThrottledProvider extends Provider {
    /**
     * @param {function} providerFn data factory
     * @param {number} [wait=1000]
     */
    constructor(providerFn, wait=1000) {
        super(providerFn);

        this._wait = wait;
        this._latestCallTime = 0;
        this._latestValue = null;
    }

    /**
     * @return {*} value from providerFn (returned not less than number of specified ms ago)
     */
    get() {
        const now = Date.now();

        if (now - this._latestCallTime >= this._wait || this._latestValue == null) {
            this._latestCallTime = now;
            this._latestValue = super.get();
        }

        return this._latestValue
    }

    /**
     * Clears the latest cached value.
     */
    reset() {
        this._latestValue = null;
    }
}