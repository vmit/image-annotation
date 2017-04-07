import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgGroup extends BaseSvgElementWrapper {
    constructor(canvasSize) {
        super('g', canvasSize);
    }

    /**
     *
     * @param element
     */
    append(element) {
        this.el.appendChild(element.el);
    }

    /**
     *
     * @param element
     */
    remove(element) {
        this.el.removeChild(element.el);
    }
}