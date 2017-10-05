import BaseShapeEditor from './base-shape-editor';
import SvgPointDraggable from '../utils/svg/svg-point-draggable';
import SvgRect from '../utils/svg/svg-rect';
import { ControlsBuilder, RemoveControlDescription as Remove } from './base-shape-editor__controls';


export default class RectangleEditor extends BaseShapeEditor {

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

        this._el.rect.deactivate();
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

    _onActivate() {
        this.emitActivate();

        this._el.rect.activate();
    }

    _onRemove() {
        this.removeFromCanvas();
    }

    render(canvas) {
        super.render(canvas);

        this._el = {
            rect: new SvgRect(this.shape.data.p1, this.shape.data.p2, this.canvasSizeProvider),
            p1: new SvgPointDraggable(this.shape.data.p1, this.canvasSizeProvider, this._onP1Drag.bind(this), this._onDrop.bind(this)),
            p2: new SvgPointDraggable(this.shape.data.p2, this.canvasSizeProvider, this._onP2Drag.bind(this), this._onDrop.bind(this))
        };

        this._el.rect.el.addEventListener('click', this._onActivate.bind(this));

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
