import {normalizeX, normalizeY} from '../../utils/position';
import SvgGroup from './svg-g';
import SvgLine from './svg-line';
import SvgPolygon from './svg-polygon';


export default class SvgPolygonEditable extends SvgGroup {
    get points() { return this._polygonElement.points; }
    set points(points) {
        this._prepareLines(points);
        this._polygonElement.points = points;
    }
    get canvasSize() { return this._polygonElement.canvasSize; }

    constructor(points, canvasSizeProvider, onAddPoint) {
        super(canvasSizeProvider);

        this._points = points;
        this._onAddPoint = onAddPoint;
        this._lineElements = [];
        this._polygonElement = new SvgPolygon(points, canvasSizeProvider);

        this.append(this._polygonElement);

        this._prepareLines(points);
    }

    activate() {
        this._polygonElement.activate();
    }

    deactivate() {
        this._polygonElement.deactivate();
    }

    render() {
        this.points = this._points;
    }

    _prepareLines(points) {
        const length = points.length;
        let i = 0;
        for (; i < points.length; i++) {
            const start = points[i];
            const end = points[(i + 1) % length];

            if (this._lineElements[i]) {
                this._lineElements[i].start = start;
                this._lineElements[i].end = end
            } else {
                this._lineElements[i] = new SvgLine(start, end, this.canvasSizeProvider, 'polygon-overlay-line');
                this._lineElements[i].el.addEventListener('dblclick', this._onLineDblClicked.bind(this, i));
                this.append(this._lineElements[i]);
            }
        }

        for (; i < this._lineElements.length; i++) {
            this.remove(this._lineElements[i]);
        }

        this._lineElements.length = length;
    }

    _onLineDblClicked(index, event) {
        const position = index + 1;
        const point = { x: normalizeX(event.clientX, this.canvasSize), y: normalizeY(event.clientY, this.canvasSize) };
        const points = this.points;

        points.splice(position, 0, point);
        this.points = points;

        this._onAddPoint(point, position);
    }

}