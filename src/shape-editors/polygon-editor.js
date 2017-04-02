import BaseShapeEditor from './base-shape-editor';
import SvgPoint from '../utils/svg/svg-point';
import SvgPolygon from '../utils/svg/svg-polygon';


export default class PolygonEditor extends BaseShapeEditor {

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