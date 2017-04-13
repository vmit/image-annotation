/**
 * Simple cache of one value. Could be used for heavily computed values in frequent calls (like "mousemove" handler).
 */
export default class ThrottledProvider {
    /**
     * @param {function} providerFn
     * @param {number} [wait=1000]
     */
    constructor(providerFn, wait=1000) {
        this._providerFn = providerFn;
        this._wait = wait;
        this._latestCallTime = 0;
        this._latestValue = null;
    }

    /**
     * @return {*} value returned from providerFn
     */
    get() {
        const now = Date.now();

        if (now - this._latestCallTime > this._wait || this._latestValue == null) {
            this._latestCallTime = now;
            this._latestValue = this._providerFn();
        }

        return this._latestValue
    }

    clear() {
        this._latestValue = null;
    }
}