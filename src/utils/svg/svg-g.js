import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgGroup extends BaseSvgElementWrapper {
    /**
     * @param {Provider<CanvasSize>} canvasSizeProvider
     */
    constructor(canvasSizeProvider) {
        super('g', canvasSizeProvider);
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