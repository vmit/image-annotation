import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolygon extends BaseSvgElementWrapper {
    set start(start) {
        this.set('x1', this.toPxX(start.x));
        this.set('y1', this.toPxY(start.y));
    }
    set end(end) {
        this.set('x2', this.toPxX(end.x));
        this.set('y2', this.toPxY(end.y));
    }

    /**
     * @param start
     * @param end
     * @param clientSize
     */
    constructor(start, end, canvasSize) {
        super('line', canvasSize);

        this.start = start;
        this.end = end;
    }

}