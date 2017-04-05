export default class ThrottledProvider {
    constructor(providerFn, wait=1000) {
        this._providerFn = providerFn;
        this._wait = wait;
        this._latestCall = 0;
        this._latestValue = null;
    }

    get() {
        const now = Date.now();

        if (now - this._latestCall > this._wait) {
            this._latestCall = now;
            this._latestValue = this._providerFn();
        }

        return this._latestValue
    }
}