
export default class BaseSvgElementWrapper {
    get el() { return this._el; }

    /**
     * @param {string} type
     * @param {string} [name]
     */
    constructor(type, name) {
        this._el = document.createElementNS("http://www.w3.org/2000/svg", type);

        this.addClass(`ia-element`);
        this.addClass(`ia-element-${name || type}`);
    }

    addClass(className) {
        this.set('class', `${this.get('class') || ''} ${className}`);
    }

    get(attribute) {
        return this._el.getAttribute(attribute);
    }

    set(attribute, value) {
        this._el.setAttribute(attribute, value);
    }

}

