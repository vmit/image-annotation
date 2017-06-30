import BaseShapeEditor from './base-shape-editor';
import SvgPointDraggable from '../utils/svg/svg-point-draggable';
import SvgRect from '../utils/svg/svg-rect';


export default class RectangleEditor extends BaseShapeEditor {

    /**
     * @param {Shape} shape
     * @param {string} [name=shape.type]
     */
    constructor(shape, name=shape.type) {
        super(shape, name);
    }

    _onP1Drag() {
        this._el.rect.p1 = this._el.p1.point;
    }

    _onP2Drag() {
        this._el.rect.p2 = this._el.p2.point;
    }

    _onDrop() {
        this.emitUpdate();
    }

    render(canvas) {
        super.render(canvas);

        this._el = {
            rect: new SvgRect(this.shape.data.p1, this.shape.data.p2, this.canvasSizeProvider),
            p1: new SvgPointDraggable(this.shape.data.p1, this.canvasSizeProvider, this._onP1Drag.bind(this), this._onDrop.bind(this)),
            p2: new SvgPointDraggable(this.shape.data.p2, this.canvasSizeProvider, this._onP2Drag.bind(this), this._onDrop.bind(this))
        };

        this.append(this._el.rect);
        this.append(this._el.p1);
        this.append(this._el.p2);
    }

    rerender() {
        super.rerender();

        this._el.rect.render();
        this._el.p1.render();
        this._el.p2.render();
    }

}