import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgGroup extends BaseSvgElementWrapper {
    constructor(canvasSize) {
        super('g', canvasSize);
    }
}