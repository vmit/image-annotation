import {normalizeX, normalizeY} from '../utils/position';
import BaseShapeEditor from './base-shape-editor';
import SvgPointDraggable from '../utils/svg/svg-point-draggable';
import SvgLine from '../utils/svg/svg-line';
import SvgGroup from '../utils/svg/svg-g';
import SvgPolygon from '../utils/svg/svg-polygon';


class PolygonOnSteroids extends SvgGroup {
    set points(points) {
        this._prepareLines(points);
        this._polygonElement.points = points;
    }

    constructor(points, canvasSize, onLineDblClicked) {
        super(canvasSize);

        this._polygonElement = new SvgPolygon(points, canvasSize);
        this._lineElements = [];
        this._onLineDblClicked = onLineDblClicked;

        this.append(this._polygonElement);

        this._prepareLines(points);
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
                this._lineElements[i] = new SvgLine(start, end, this.canvasSize, 'polygon-overlay-line');
                this._lineElements[i].el.addEventListener('dblclick', this._onLineDblClicked.bind(this, i));
                this.append(this._lineElements[i]);
            }
        }

        for (; i < this._lineElements.length; i++) {
            this.remove(this._lineElements[i]);
        }

        this._lineElements.length = length;
    }
}

export default class PolygonEditor extends BaseShapeEditor {

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
            this._activatePoint(this._el.draggablePoint = pointElement);
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

    _onLineDblClicked(index, event) {
        const position = index + 1;
        const point = { x: normalizeX(event.clientX, this.canvasSize), y: normalizeY(event.clientY, this.canvasSize) };
        const pointElement = this._addPoint(point, position);
        this.shape.data.splice(position, 0, point);
        this._el.polygon.points = this.shape.data;
        this._activatePoint(pointElement);

        this.emit('shape:editor:updated', this.shape);
    }

    render(canvas) {
        super.render(canvas);

        this._el = {
            activePoint: null,
            draggablePoint: null,
            pointElements: [],
            polygon: new PolygonOnSteroids(this.shape.data, this.canvasSize, this._onLineDblClicked.bind(this))
        };

        this.append(this._el.polygon);
        this.shape.data.forEach(this._addPoint.bind(this));
    }
}