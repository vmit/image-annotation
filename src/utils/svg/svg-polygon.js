import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolygon extends BaseSvgElementWrapper {
    get points() { return this._points; }
    set points(points) {
        this._points = points;
        this.set('points', points.map((point) => `${this.toPxX(point.x)},${this.toPxY(point.y)}`).join(' '));
    }

    /**
     * @param points
     * @param clientSize
     */
    constructor(points, canvasSizeProvider) {
        super('polygon', canvasSizeProvider);

        this._points = points;

        this.render();
    }

    activate() {
        this.addClass('ia-element_active');
    }

    deactivate() {
        this.removeClass('ia-element_active');
    }

    render() {
        this.points = this._points;
    }

}