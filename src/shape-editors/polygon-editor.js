import BaseShapeEditor from './base-shape-editor';
import SvgPoint from '../utils/svg/svg-point';
import SvgPolygon from '../utils/svg/svg-polygon';


export default class PolygonEditor extends BaseShapeEditor {

    constructor(shape) {
        super(shape);

        this._pointElements = [];
    }

    onCanvasMouseMove(x, y) {
        if (this._el.draggablePoint) {
            this._el.draggablePoint.point = { x, y }
            this._el.polygon.points = this.shape.data;
        }
    }

    onRemove() {
        if (this._el.activePoint) {
            this._removePoint(this._el.activePoint);
        }
    }

    onDeactivated() {
        super.onDeactivated();

        this._el.activePoint = null;
        this._el.draggablePoint = null;
        this._activatePoint(null);
    }

    _removePoint(point) {
        const index = this._pointElements.indexOf(point);
        this._pointElements.splice(index, 1);
        this.shape.data.splice(index, 1);
        this._el.polygon.points = this.shape.data;
        this.remove(point);

        if (this.shape.data.length == 1) {
            this.emit('shape:editor:remove', this);
            this.removeFromCanvas();
        } else {
            this._activatePoint(this._pointElements[index] || this._pointElements[index-1]);
        }

        this.emit('shape:editor:updated', this.shape);
    }

    _addPoint(point) {
        const pointElement = new SvgPoint(point, this.canvasSize);
        this.append(pointElement);
        this._pointElements.push(pointElement);

        pointElement.el.addEventListener('mousedown', this._onPointMouseDown.bind(this, pointElement));
        pointElement.el.addEventListener('mouseup', this._onPointMouseUp.bind(this, pointElement));
    }

    _activatePoint(pointElement) {
        this._el.activePoint = pointElement;
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
        this._activatePoint(pointElement);
        this._el.draggablePoint = null;
        this.emit('shape:editor:updated', this.shape);
    }

    render(canvas) {
        super.render(canvas);

        this._el = {
            activePoint: null,
            draggablePoint: null,
            polygon: new SvgPolygon(this.shape.data, this.canvasSize)
        };

        this.append(this._el.polygon);
        this.shape.data.forEach(this._addPoint.bind(this));
    }
}