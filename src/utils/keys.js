
const keys = {
    ESC: 27,
    ENTER: 13,
    TAB: 89,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40
}

Object.defineProperty(keys, 'fromKeyCode', {
    enumerable: false,
    value: function(code) {
        if (!this._indexedByCodeKeys) {
            this._indexedByCodeKeys = Object
                .keys(this)
                .filter((k) => typeof this[k] !== 'function')
                .reduce((acc, k) => (acc[this[k]] = this[k], acc), {});
        }

        return this._indexedByCodeKeys[code];
    }
});

export default keys;