import '../../data-types/canvas-size'
import Provider from '../provider';

/**
 * Basic functionality for SVG elements (to be wrapped), mostly for adding/removing attributes. It also
 * contains utility methods for converting normalized (x/y axises in [0:1.0] range) coordinates into px.
 */
export default class BaseSvgElementWrapper {
    get el() { return this._el; }
    get canvasSizeProvider() { return this._canvasSizeProvider; }
    get canvasSize() { return this.canvasSizeProvider.get(); }

    /**
     * @param {string} type - one of supported by SVG tag name
     * @param {Provider<CanvasSize>} canvasSizeProvider - should return {CanvasSize} object
     * @param {string} [name=type] - specifies class name to distinguish identical SVG elements with different roles
     */
    constructor(type, canvasSizeProvider, name=type) {
        this._el = document.createElementNS("http://www.w3.org/2000/svg", type);
        this._canvasSizeProvider = canvasSizeProvider;

        this.addClass(`ia-element`);
        this.addClass(`ia-element-${name}`);
    }

    /**
     * Adds another class name to appropriate attribute (separated by spaces).
     *
     * @param {string} className
     */
    addClass(className) {
        this.el.classList.add(className);
    }

    /**
     * Removes class name from appropriate attribute.
     *
     * @param {string} className
     */
    removeClass(className) {
        this.el.classList.remove(className);
    }

    /**
     * Provides value from SVG element's attribute.
     *
     * @param {string} attribute
     * @return {string}
     */
    get(attribute) {
        return this._el.getAttribute(attribute);
    }

    /**
     * Sets SVG element's attribute.
     *
     * @param {string} attribute
     * @return {string}
     */
    set(attribute, value) {
        if (value === null || value === undefined) {
            this._el.removeAttribute(attribute);
        } else {
            this._el.setAttribute(attribute, value);
        }
    }

    /**
     * Converts normalized x value into pixels on canvas.
     * Range [0:1] maps to [0:<width>].
     *
     * @param {number} xNormalized
     */
    toPxX(xNormalized) {
        return xNormalized * this.canvasSize.width;
    }

    /**
     * Converts normalized y value into pixels on canvas.
     * Range [0:1] maps to [0:<height>].
     *
     * @param {number} yNormalized
     */
    toPxY(yNormalized) {
        return yNormalized * this.canvasSize.height;
    }

    /**
     * Updates element visual presentation. Can be called multiple times.
     */
    render() {}

}

