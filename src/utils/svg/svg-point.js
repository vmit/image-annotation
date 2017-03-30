import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPoint extends BaseSvgElementWrapper {
    set point(value) {
        this.set('cx', value.x);
        this.set('cy', value.y);
    }

    /**
     * @param point
     */
    constructor(point) {
        super('circle', 'point');

        this.set('r', 1);
        this.point = point;
    }

}