import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolygon extends BaseSvgElementWrapper {
    set start(start) {
        this.set('x1', start.x);
        this.set('y1', start.y);
    }
    set end(end) {
        this.set('x2', end.x);
        this.set('y2', end.y);
    }

    /**
     * @param start
     * @param end
     */
    constructor(start, end) {
        super('line');

        this.start = start;
        this.end = end;
    }

}