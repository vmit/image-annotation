import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolygon extends BaseSvgElementWrapper {
    get points() { return this._points; }
    set points(points) {
        this.set('points', points.map((point) => `${this.toPxX(point.x)},${this.toPxY(point.y)}`).join(' '));

        for (let i = 0; i < points.length; i++) {
            this._points[i] = points[i];
        }
        this._points.length = points.length;
    }

    /**
     * @param points
     * @param clientSize
     */
    constructor(points, clientSize) {
        super('polygon', clientSize);

        this.points = this._points = points;
    }

}