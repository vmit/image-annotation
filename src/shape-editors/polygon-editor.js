import BaseShapeEditor from './base-shape-editor';
import SvgPointDraggable from '../utils/svg/svg-point-draggable';
import SvgPolygonEditable from '../utils/svg/svg-polygon-editable';


export default class PolygonEditor extends BaseShapeEditor {

    onRemove() {
        if (this._el.activePoint) {
            this._removePoint(this._el.activePoint);
        }
    }

    onDeactivated() {
        super.onDeactivated();

        this._el.activePoint = null;
        this._activatePoint(null);
    }

    _removePoint(point) {
        const index = this._el.pointElements.indexOf(point);

        this._el.pointElements.splice(index, 1);
        this.shape.data.splice(index, 1);
        this._el.polygon.points = this.shape.data;
        this.remove(point);

        if (this.shape.data.length == 1) {
            this.emit('shape:editor:remove', this);
            this.removeFromCanvas();
        } else {
            this._activatePoint(this._el.pointElements[index] || this._el.pointElements[index-1]);
        }

        this.emit('shape:editor:updated', this.shape);
    }

    _addPoint(point, position = this._el.pointElements.length) {
        const pointElement = new SvgPointDraggable(point, this.canvasSize, this._onPointDragged.bind(this), this._onPointDropped.bind(this));
        this.append(pointElement);
        this._el.pointElements.splice(position, 0, pointElement);
        pointElement.el.addEventListener('click', () => {
            this._activatePoint(pointElement);
            this.activate();
        });

        return pointElement;
    }

    _activatePoint(pointElement) {
        this._el.activePoint = pointElement;
        this.emit('point:activate', pointElement);

        if (pointElement != null) {
            pointElement.activate();
            // only one active point is allowed
            this.once('point:activate', () => pointElement.deactivate());
        }
    }

    _onPointDragged() {
        this._el.polygon.points = this.shape.data;
    }

    _onPointDropped() {
        this.emit('shape:editor:updated', this.shape);
    }

    _onAddPoint(point, position) {
        this._activatePoint(this._addPoint(point, position));

        this.emit('shape:editor:updated', this.shape);
    }

    render(canvas) {
        super.render(canvas);

        this._el = {
            activePoint: null,
            pointElements: [],
            polygon: new SvgPolygonEditable(this.shape.data, this.canvasSize, this._onAddPoint.bind(this))
        };

        this.append(this._el.polygon);
        this.shape.data.forEach(this._addPoint.bind(this));
    }
}