
export default class BaseSvgElementWrapper {
    get el() { return this._el; }

    /**
     * @param {string} type
     */
    constructor(type, style) {
        this._el = document.createElementNS("http://www.w3.org/2000/svg", type);
        for (const prop in style) {
            this._el.style[prop] = style[prop];
        }
    }

    get(attribute) {
        return this._el.getAttribute(attribute);
    }

    set(attribute, value) {
        this._el.setAttribute(attribute, value);
    }

}

