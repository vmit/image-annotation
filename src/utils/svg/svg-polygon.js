import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolygon extends BaseSvgElementWrapper {
    set points(points) {
        this.set('points', points.map((point) => `${this.toPxX(point.x)},${this.toPxY(point.y)}`).join(' '));
    }

    /**
     * @param points
     * @param clientSize
     */
    constructor(points, clientSize) {
        super('polygon', clientSize);

        this.points = points;
    }

}