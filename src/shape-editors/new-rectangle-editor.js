import { normalizeX, normalizeY } from '../utils/position';
import BaseNewShapeEditor from './base-new-shape-editor';
import SvgPoint from '../utils/svg/svg-point';
import SvgRect from '../utils/svg/svg-rect';


export default class NewRectangleEditor extends BaseNewShapeEditor {
    constructor() {
        super({ type: 'rectangle', data: [] }, 'new-rectangle');

        this._isAnchorPointSet = false;
    }

    _onMouseDown(event) {
        if (!this._isAnchorPointSet) {
            const point = { x: normalizeX(event.clientX, this.canvasSize), y: normalizeY(event.clientY, this.canvasSize)};

            this._el.anchorPoint.point = point;
            this._el.rect.p1 = point;

            this._isAnchorPointSet = true;
        }
    }

    _onMouseUp(event) {
        if (this._isAnchorPointSet) {
            this.shape.data = {
                p1: this._el.rect.p1,
                p2: {
                    x: normalizeX(event.clientX, this.canvasSize),
                    y: normalizeY(event.clientY, this.canvasSize)
                }
            };

            this.emit('new:shape:editor:create', this);
        }
    }

    _onMouseMove(event) {
        event.stopPropagation();

        if (this._isAnchorPointSet) {
            const point = {
                x: normalizeX(event.clientX, this.canvasSize),
                y: normalizeY(event.clientY, this.canvasSize)
            };
            this._el.rect.p2 = point;
        }
    }

    render(canvas) {
        super.render(canvas);

        this._el = {
            anchorPoint: new SvgPoint({ x: -1, y: -1 }, this.canvasSizeProvider),
            rect: new SvgRect(null, null, this.canvasSizeProvider)
        };

        this.append(this._el.rect);
        this.append(this._el.anchorPoint);

        this.overlay.el.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.overlay.el.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.overlay.el.addEventListener('mousemove', this._onMouseMove.bind(this));
    }
}
