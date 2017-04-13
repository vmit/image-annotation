import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolyline extends BaseSvgElementWrapper {
    get points() { return this._points; }
    set points(points) {
        this._points = points;
        this.set('points', points.map((point) => `${this.toPxX(point.x)},${this.toPxY(point.y)}`).join(' '));
    }

    /**
     * @param points
     * @param canvasSizeProvider
     * @param name
     */
    constructor(points, canvasSizeProvider, name) {
        super('polyline', canvasSizeProvider, name);

        this._points = points;

        this.render();
    }

    render() {
        this.points = this._points;
    }

}