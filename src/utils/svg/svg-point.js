import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPoint extends BaseSvgElementWrapper {
    get point() { return this._point }
    set point(value) {
        this.set('cx', this.toPxX(this._point.x = value.x));
        this.set('cy', this.toPxY(this._point.y = value.y));
    }
    set radius(value) {
        this.set('r', value);
    }

    /**
     * @param point
     * @param clientSize
     * @param {string} [name='point']
     * @param {number} [radius=3]
     */
    constructor(point, clientSize, name='point', radius=3) {
        super('circle', clientSize, name);

        this.point = this._point = point;
        this.radius = radius;
    }

    activate() {
        this.addClass('ia-active-point');
    }

    deactivate() {
        this.removeClass('ia-active-point');
    }

}