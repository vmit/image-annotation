import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolygon extends BaseSvgElementWrapper {
    set points(points) {
        this.set('points', points.map((point) => `${point.x},${point.y}`).join(' '));
    }

    /**
     * @param points
     * @param style
     */
    constructor(points, style) {
        super('polygon', style);

        this.points = points;
    }

}