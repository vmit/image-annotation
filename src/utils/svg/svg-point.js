import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPoint extends BaseSvgElementWrapper {
    get point() { return this._point }
    set point(value) {
        this.set('cx', this._point.x = value.x);
        this.set('cy', this._point.y = value.y);
    }

    /**
     * @param point
     */
    constructor(point) {
        super('circle', 'point');

        this.set('r', 3);
        this.point = this._point = point;
    }

}