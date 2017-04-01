import BaseShapeEditor from './base-shape-editor';
import SvgPoint from '../utils/svg/svg-point';
import SvgPolygon from '../utils/svg/svg-polygon';
import SvgLine from '../utils/svg/svg-line';
import SvgPolyline from '../utils/svg/svg-polyline';
import Keys from '../utils/keys';


export class PolygonEditor extends BaseShapeEditor {

    constructor(shape) {
        super(shape);
    }

    onCanvasMouseMove(x, y) {
        if (this._el.draggablePoint) {
            this._el.draggablePoint.point = { x, y }
            this._el.polygon.points = this.shape.data;
        }
    }

    onDeactivated() {
        super.onDeactivated();

        this._el.activePoint = null;
        this._el.draggablePoint = null;
        this._activatePoint(null);
    }

    _addPoint(point) {
        const pointElement = new SvgPoint(point);
        this.append(pointElement);

        pointElement.el.addEventListener('mousedown', this._onPointMouseDown.bind(this, pointElement));
        pointElement.el.addEventListener('mouseup', this._onPointMouseUp.bind(this, pointElement));
    }

    _activatePoint(pointElement) {
        this.emit('point:activate', pointElement);

        if (pointElement != null) {
            pointElement.addClass('ia-active-point');
            // only one active point is allowed
            this.once('point:activate', () => pointElement.removeClass('ia-active-point'));
        }
    }

    _onPointMouseDown(pointElement) {
        this._activatePoint(this._el.draggablePoint = pointElement);
        this.activate();
    }

    _onPointMouseUp(pointElement) {
        this._el.activePoint = pointElement;
        this._el.draggablePoint = null;
    }

    render() {
        this._el = {
            activePoint: null,
            draggablePoint: null,
            polygon: new SvgPolygon(this.shape.data)
        };

        this.append(this._el.polygon);
        this.shape.data.forEach(this._addPoint.bind(this));
    }
}

export class NewPolygonEditor extends BaseShapeEditor {

    constructor() {
        super({ type: 'polygon', data: [] }, 'new-polygon');
    }

    onCanvasClick(x, y) {
        this._addPoint(x, y);
    }

    onCanvasMouseMove(x, y) {
        this._updateActiveLine(x, y);
    }

    onCanvasKeyPressed(key) {
        if (key === Keys.ESC) {
            this._removeLastPoint();
        } else if (key === Keys.ENTER) {
            this._closePolygon();
        }
    }

    _addPoint(x, y) {
        const point = {x, y};
        const pointElement = new SvgPoint(point);

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
            this.removeFromCanvas();
        } else {
            this._el.polyline.points = this.shape.data;
            this._el.activeLine.start = this.shape.data[this.shape.data.length - 1];
        }
    }

    _updateActiveLine(x, y) {
        if (this.shape.data.length > 0) {
            const prevPoint = this.shape.data[this.shape.data.length - 1];

            this._el.activeLine.start = prevPoint;
            this._el.activeLine.end = { x, y };
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
            this.removeFromCanvas();

            return true;
        }

        return false;
    }

    render() {
        this._el = {
            polyline: new SvgPolyline([]),
            activeLine: new SvgLine({ x: -1, y: -1 }, { x: -1, y: -1 }),
            points: []
        }

        this.append(this._el.polyline);
        this.append(this._el.activeLine);
    }
}