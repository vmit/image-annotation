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
     */
    constructor(points, clientSize) {
        super('polyline', clientSize);

        this.points = points;
    }

}