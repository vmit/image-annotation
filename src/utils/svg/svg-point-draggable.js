import {normalizeX, normalizeY} from '../../utils/position';
import SvgPoint from './svg-point';
import SvgGroup from './svg-g';


export default class SvgPointDraggable extends SvgGroup {
    get point() { return this._pointElement.point }
    set point(value) {
        this._pointUnderlayElement.point = value;
        this._pointElement.point = value;
    }

    /**
     * @param point
     * @param canvasSize
     * @param {function} onDrag
     */
    constructor(point, canvasSize, onDrag, onDrop) {
        super(canvasSize);

        this.append(this._pointUnderlayElement = new SvgPoint(point, canvasSize, 'point-underlay', 0));
        this.append(this._pointElement = new SvgPoint(point, canvasSize));

        this._onDrag = onDrag;
        this._onDrop = onDrop;

        this.el.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.el.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.el.addEventListener('mousemove', this._onMouseMove.bind(this));

        this._setDraggingMode(false);
    }

    activate() {
        this._pointElement.addClass('ia-active-point');
    }

    deactivate() {
        this._pointElement.removeClass('ia-active-point');
    }

    _onMouseDown(event) {
        this._setDraggingMode(true);
    }

    _onMouseUp(event) {
        if (this._isDragging) {
            this._setDraggingMode(false);
            const point = { x: normalizeX(event.clientX, this.canvasSize), y: normalizeY(event.clientY, this.canvasSize) };
            this._onDrop(point);
        }
    }

    _onMouseMove(event) {
        if (this._isDragging) {
            const point = { x: normalizeX(event.clientX, this.canvasSize), y: normalizeY(event.clientY, this.canvasSize) };
            this.point = point;
            this._onDrag(point);
        }
    }

    _setDraggingMode(isDragging) {
        this._isDragging = isDragging;
        this._pointUnderlayElement.radius = isDragging ? 40: 0;
    }

}