import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolygon extends BaseSvgElementWrapper {
    set points(points) {
        this.set('points', points.map((point) => `${point.x},${point.y}`).join(' '));
    }

    /**
     * @param points
     */
    constructor(points) {
        super('polygon');

        this.points = points;
    }

}