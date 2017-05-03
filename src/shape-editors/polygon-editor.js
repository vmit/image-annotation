import BaseShapeEditor from './base-shape-editor';
import SvgPointDraggable from '../utils/svg/svg-point-draggable';
import SvgPolygonEditable from '../utils/svg/svg-polygon-editable';
import { ControlsBuilder, RemoveControlDescription as Remove } from './base-shape-editor__controls';


export default class PolygonEditor extends BaseShapeEditor {

    /**
     * @param {Shape} shape
     * @param {string} [name=shape.type]
     */
    constructor(shape, name=shape.type) {
        super(shape, name);

        this._controlsBuilder = new ControlsBuilder([new Remove(this._onActivePointRemove.bind(this)) ]);
        this.controls = this._controlsBuilder.enable(Remove.id).build();
    }

    onDeactivated() {
        super.onDeactivated();

        this._el.activePoint = null;
        this._activatePoint(null);
    }

    _removePoint(point) {
        const index = this._el.points.indexOf(point);

        this._el.points.splice(index, 1);
        this.shape.data.splice(index, 1);
        this._el.polygon.points = this.shape.data;
        this.remove(point);

        if (this.shape.data.length == 1) {
            this.removeFromCanvas();
        } else {
            this._activatePoint(this._el.points[index] || this._el.points[index-1]);
        }

        this.emitUpdate();
    }

    _addPoint(point, position = this._el.points.length) {
        const pointElement = new SvgPointDraggable(point, this.canvasSizeProvider, this._onPointDragged.bind(this), this._onPointDropped.bind(this));
        this.append(pointElement);
        this._el.points.splice(position, 0, pointElement);
        pointElement.el.addEventListener('click', () => {
            this._activatePoint(pointElement);
            this.emitActivate();
        });

        return pointElement;
    }

    _activatePoint(pointElement) {
        this._el.activePoint = pointElement;
        this.emit('_inner:point:activate', pointElement);

        if (pointElement != null) {
            pointElement.activate();
            // only one active point is allowed
            this.once('_inner:point:activate', () => pointElement.deactivate());
        }
    }

    _onPointDragged() {
        this._el.polygon.render();
    }

    _onPointDropped() {
        this.emitUpdate();
    }

    _onAddPoint(point, position) {
        this._activatePoint(this._addPoint(point, position));

        this.emitUpdate();
    }

    _onActivePointRemove() {
        if (this._el.activePoint) {
            this._removePoint(this._el.activePoint);
        }
    }

    render(canvas) {
        super.render(canvas);

        this._el = {
            activePoint: null,
            polygon: new SvgPolygonEditable(this.shape.data, this.canvasSizeProvider, this._onAddPoint.bind(this)),
            points: []
        };

        this.append(this._el.polygon);
        this.shape.data.forEach(this._addPoint.bind(this));
    }

    rerender() {
        super.rerender();

        this._el.polygon.render();
        this._el.points.forEach((point) => point.render());
    }
}