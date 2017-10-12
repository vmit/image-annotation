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

        this._controlsBuilder = new ControlsBuilder([new Remove(this._onRemove.bind(this)) ]);
        this.controls = this._controlsBuilder.enable(Remove.id).build();
    }

    onDeactivated() {
        super.onDeactivated();

        this._el.activePoint = null;
        this._activatePoint(null);
        this._el.polygon.deactivate();
    }


    onKeyPressed(key, altKey, shiftKey) {
        let pointMoveXGap = 20 / this.canvasSize.width;
        let pointMoveYGap = 20 / this.canvasSize.height;
        if (altKey && !shiftKey) {
            pointMoveXGap *= 0.1;
            pointMoveYGap *= 0.1;
        } else if (altKey && shiftKey) {
            pointMoveXGap *= 3;
            pointMoveYGap *= 3;
        }

        switch (key) {
            case 'D':
                if (this._el.activePoint) {
                    this._removePoint(this._el.activePoint);
                } else {
                    this.removeFromCanvas();
                }
                break;
            case 'ArrowUp':
                this._updateActivePointByArrowKey('y', pointMoveYGap * -1);
                break;
            case 'ArrowDown':
                this._updateActivePointByArrowKey('y', pointMoveYGap);
                break;
            case 'ArrowLeft':
                this._updateActivePointByArrowKey('x', pointMoveXGap * -1);
                break;
            case 'ArrowRight':
                this._updateActivePointByArrowKey('x', pointMoveXGap);
                break;
            case 'Tab':
                if (this._el.activePoint) {
                    const index = this._el.points.indexOf(this._el.activePoint);

                    if (shiftKey) {
                        this._activatePoint(this._el.points[index-1] || this._el.points[this._el.points.length - 1]);
                    } else {
                        this._activatePoint(this._el.points[index+1] || this._el.points[0]);
                    }
                }
                break;
            default:
                super.onKeyPressed(key, altKey, shiftKey);
        }
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
        });

        return pointElement;
    }

    _activatePoint(pointElement) {
        this._el.activePoint = pointElement;
        this.emit('_inner:point:activate', pointElement);

        if (pointElement != null) {
            this._el.polygon.deactivate();
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

    /**
     * Move the active point along axis on amount value
     *
     * @param {string="x","y"} axis The axis along which the point will be shifted
     * @param {number} amount The distance the point will move along the axis
     * @private
     */
    _updateActivePointByArrowKey(axis, amount) {
        if (this._el.activePoint) {
            this._el.activePoint.point[axis] += amount;

            if (amount < 0 && this._el.activePoint.point[axis] < 0) {
                this._el.activePoint.point[axis] = 0;
            } else if (amount > 0 && this._el.activePoint.point[axis] > 1) {
                this._el.activePoint.point[axis] = 1;
            }

            this._el.activePoint.render();
            this._el.polygon.render();
        }
    }

    _onAddPoint(point, position) {
        this._activatePoint(this._addPoint(point, position));

        this.emitUpdate();
    }

    _onRemove() {
        if (this._el.activePoint) {
            this._removePoint(this._el.activePoint);
        } else {
            this.removeFromCanvas();
        }
    }

    _onActivate() {
        this._el.polygon.activate();
        this._activatePoint(null);
        this.emitActivate();
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

        this._el.polygon.el.addEventListener('click', this._onActivate.bind(this));
    }

    rerender() {
        super.rerender();

        this._el.polygon.render();
        this._el.points.forEach((point) => point.render());
    }
}
