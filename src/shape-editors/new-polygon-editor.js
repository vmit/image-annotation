import {normalizeX, normalizeY} from '../utils/position';
import BaseNewShapeEditor from './base-new-shape-editor';
import SvgPoint from '../utils/svg/svg-point';
import SvgLine from '../utils/svg/svg-line';
import SvgPolyline from '../utils/svg/svg-polyline';
import Keys from '../utils/keys';


export default class NewPolygonEditor extends BaseNewShapeEditor {

    constructor() {
        super({ type: 'polygon', data: [] }, 'new-polygon');
    }

    onCanvasKeyPressed(key) {
        if (key === Keys.ESC) {
            this._removeLastPoint();
        } else if (key === Keys.ENTER) {
            this._closePolygon();
        }
    }

    onRemove() {
        this.emit('shape:cancel', this.shape);
    }

    onDeactivated() {
        super.onDeactivated();

        this.removeFromCanvas();
    }

    _addPoint(point) {
        const pointElement = new SvgPoint(point, this.canvasSize);

        if (this.shape.data.length == 0) {
            pointElement.addClass('ia-first-point');
            pointElement.el.addEventListener('click', this._onFirstPointCLick.bind(this));
        }

        this.shape.data.push(point);
        this._el.points.push(pointElement);

        this.append(pointElement);
        this._el.polyline.points = this.shape.data;
    }

    _removeLastPoint() {
        this.remove(this._el.points.pop());
        this.shape.data.pop();

        if (this.shape.data.length == 0) {
            this.emit('shape:cancel', this.shape);
        } else {
            this._el.polyline.points = this.shape.data;
            this._el.activeLine.start = this.shape.data[this.shape.data.length - 1];
        }
    }

    _updateActiveLine(point) {
        if (this.shape.data.length > 0) {
            const prevPoint = this.shape.data[this.shape.data.length - 1];

            this._el.activeLine.start = prevPoint;
            this._el.activeLine.end = point;
        }
    }

    _onFirstPointCLick(e) {
        const isClosed = this._closePolygon();
        if (!isClosed) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    _closePolygon() {
        if (this.shape.data.length > 2) {
            this.emit('shape:new', this.shape);

            return true;
        }

        return false;
    }

    _onClickOverlay(event) {
        const point = { x: normalizeX(event.clientX, this.canvasSize), y: normalizeY(event.clientY, this.canvasSize) };
        console.log(point)
        this._addPoint(point);
    }

    _onMouseMove(event) {
        const point = { x: normalizeX(event.clientX, this.canvasSize), y: normalizeY(event.clientY, this.canvasSize) };
        this._updateActiveLine(point);
    }

    render(canvas) {
        super.render(canvas);

        this._el = {
            polyline: new SvgPolyline([], this.canvasSize, 'new-polygon-polyline'),
            activeLine: new SvgLine({ x: -1, y: -1 }, { x: -1, y: -1 }, this.canvasSize, 'active-line'),
            points: []
        }

        this.append(this._el.polyline);
        this.append(this._el.activeLine);

        this.overlay.el.addEventListener('click', this._onClickOverlay.bind(this));
        this.overlay.el.addEventListener('mousemove', this._onMouseMove.bind(this));
    }
}