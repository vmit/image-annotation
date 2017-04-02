import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPoint extends BaseSvgElementWrapper {
    get point() { return this._point }
    set point(value) {
        this.set('cx', this.toPxX(this._point.x = value.x));
        this.set('cy', this.toPxY(this._point.y = value.y));
    }

    /**
     * @param point
     * @param clientSize
     */
    constructor(point, clientSize) {
        super('circle', clientSize, 'point');

        this.set('r', 3);
        this.point = this._point = point;
    }

}