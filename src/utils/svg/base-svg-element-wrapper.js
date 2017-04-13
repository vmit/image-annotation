
export default class BaseSvgElementWrapper {
    get el() { return this._el; }
    get canvasSizeProvider() { return this._canvasSizeProvider; }
    get canvasSize() { return this.canvasSizeProvider.get(); }

    /**
     * @param {string} type
     * @param {string} [name]
     */
    constructor(type, canvasSizeProvider, name) {
        this._el = document.createElementNS("http://www.w3.org/2000/svg", type);
        this._canvasSizeProvider = canvasSizeProvider;

        this.addClass(`ia-element`);
        this.addClass(`ia-element-${name || type}`);
    }

    addClass(className) {
        this.set('class', `${this.get('class') || ''} ${className}`);
    }

    removeClass(className) {
        this.set('class', `${(this.get('class') || '').replace(className, '')}`);
    }

    get(attribute) {
        return this._el.getAttribute(attribute);
    }

    set(attribute, value) {
        this._el.setAttribute(attribute, value);
    }

    /**
     * @param value [0..1]
     */
    toPxX(value) {
        return value * this.canvasSize.width;
    }

    /**
     * @param value [0..1]
     */
    toPxY(value) {
        return value * this.canvasSize.height;
    }

    render() {}

}

