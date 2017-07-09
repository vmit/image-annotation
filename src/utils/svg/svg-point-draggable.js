import {normalizeX, normalizeY} from '../../utils/position';
import SvgPoint from './svg-point';
import SvgGroup from './svg-g';


export default class SvgPointDraggable extends SvgGroup {
    get point() { return this._pointElement.point }
    set point(point) {
        this._pointUnderlayElement.point = point;
        this._pointElement.point = point;
    }
    get canvasSize() { return this._pointElement.canvasSize; }

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
        this._pointElement.activate('ia-active-point');
    }

    deactivate() {
        this._pointElement.deactivate('ia-active-point');
    }

    render() {
        this._pointUnderlayElement.render();
        this._pointElement.render();
    }

    _onMouseDown(event) {
        this._setDraggingMode(true);
    }

    _onMouseUp(event) {
        if (this._isDragging) {
            this._setDraggingMode(false);
            this._onDrop({
                x: normalizeX(event.clientX, this.canvasSize),
                y: normalizeY(event.clientY, this.canvasSize)
            });
        }
    }

    _onMouseMove(event) {
        if (this._isDragging) {
            this.point.x = normalizeX(event.clientX, this.canvasSize);
            this.point.y = normalizeY(event.clientY, this.canvasSize);
            this._onDrag(this.point);
            this.render();
        }
    }

    _setDraggingMode(isDragging) {
        this._isDragging = isDragging;
        this._pointUnderlayElement.radius = isDragging ? 40: 0;
    }

}