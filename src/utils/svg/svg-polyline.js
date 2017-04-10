import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPolyline extends BaseSvgElementWrapper {
    set points(points) {
        this.set('points', points.map((point) =>
            `${this.toPxX(point.x)},${this.toPxY(point.y)}`).join(' ')
        );
    }

    /**
     * @param points
     * @param clientSize
     * @param name
     */
    constructor(points, clientSize, name) {
        super('polyline', clientSize, name);

        this.points = points;
    }

}