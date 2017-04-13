import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPoint extends BaseSvgElementWrapper {
    get point() { return this._point }
    set point(point) {
        this._point = point;
        this.set('cx', this.toPxX(point.x));
        this.set('cy', this.toPxY(point.y));
    }
    set radius(radius) {
        this._radius = radius;
        this.set('r', radius);
    }

    /**
     * @param point
     * @param canvasSizeProvider
     * @param {string} [name='point']
     * @param {number} [radius=3]
     */
    constructor(point, canvasSizeProvider, name='point', radius=3) {
        super('circle', canvasSizeProvider, name);

        this._point = point;
        this._radius = radius;

        this.render();
    }

    activate() {
        this.addClass('ia-active-point');
    }

    deactivate() {
        this.removeClass('ia-active-point');
    }

    render() {
        this.point = this._point;
        this.radius = this._radius;
    }

}