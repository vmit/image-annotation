import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolygon extends BaseSvgElementWrapper {
    get start() { return this._start; }
    get end() { return this._end; }

    set start(start) {
        this._start = start;
        this.set('x1', this.toPxX(start.x));
        this.set('y1', this.toPxY(start.y));
    }
    set end(end) {
        this._end = end;
        this.set('x2', this.toPxX(end.x));
        this.set('y2', this.toPxY(end.y));
    }

    /**
     * @param start
     * @param end
     * @param canvasSizeProvider
     * @param [name]
     */
    constructor(start, end, canvasSizeProvider, name) {
        super('line', canvasSizeProvider, name);

        this._start = start;
        this._end = end;

        this.render();
    }


    render() {
        this.start = this._start;
        this.end = this._end;
    }
}