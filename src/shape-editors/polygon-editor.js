import BaseShapeEditor from './base-shape-editor';
import SvgPoint from '../utils/svg/svg-point';
import SvgPolygon from '../utils/svg/svg-polygon';
import SvgLine from '../utils/svg/svg-line';
import SvgPolyline from '../utils/svg/svg-polyline';



export class PolygonEditor extends BaseShapeEditor {

    constructor(shape) {
        super(shape);
    }

    render() {
        this.append(new SvgPolygon(this.shape.data));
        this.shape.data.forEach((point) =>
            this.append(new SvgPoint(point))
        );
    }

}

export class NewPolygonEditor extends BaseShapeEditor {

    constructor() {
        super({ type: 'polygon', data: [] }, 'new-polygon');

        this._polyline = new SvgPolyline([]);
        this._activeLine = new SvgLine({ x: -1, y: -1 }, { x: -1, y: -1 });
    }

    onCanvasClick(x, y) {
        const point = {x, y};
        const svgPoint = new SvgPoint(point);

        if (this.shape.data.length == 0) {
            svgPoint.el.addEventListener('click', () => {
                this.emit('shape:new', this.shape);
                this.removeFromCanvas();
            });
        }

        this.shape.data.push(point);
        this.append(svgPoint);

        this._polyline.points = this.shape.data;
    }

    onCanvasMouseMove(x, y) {
        if (this.shape.data.length > 0) {
            const prevPoint = this.shape.data[this.shape.data.length - 1];

            this._activeLine.start = prevPoint;
            this._activeLine.end = { x, y };
        }
    }

    render() {
        this.append(this._polyline);
        this.append(this._activeLine);
    }
}