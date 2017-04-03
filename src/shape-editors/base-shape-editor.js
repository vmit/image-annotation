import EventEmitter from 'events';
import SvgGroup from '../utils/svg/svg-g';
import assert from '../utils/assert';


export default class BaseShapeEditor extends EventEmitter {
    get container() { return this._container; }
    get shape() { return this._shape; }
    get canvas() {
        assert(this._canvas, 'the editor is not rendered, forgot to call parent\'s render()?');
        return this._canvas;
    }
    get canvasSize() {
        assert(this._canvasSize, 'the editor is not rendered, forgot to call parent\'s render()?');
        return this._canvasSize;
    }

    constructor(shape, name) {
        super();

        this._shape = shape;
        this._name = name || shape.type;
        this._isActive = false;
        this._container = null;
        this._canvas = null;
        this._canvasSize = null;
    }

    activate() {
        if (!this._isActive) {
            this.emit('shape:editor:activate', this);
        }
    }

    /**
     * @param {BaseSvgElementWrapper} element
     */
    append(element) {
        this.container.el.appendChild(element.el);
    }

    /**
     * @param {BaseSvgElementWrapper} element
     */
    remove(element) {
        this.container.el.removeChild(element.el);
    }

    removeFromCanvas() {
        this.canvas.removeChild(this.container.el);
        this._canvas = null;
    }

    render(canvas) {
        this._canvas = canvas;
        this._canvasSize = canvas.getBoundingClientRect();
        this._container = new SvgGroup(this._canvasSize);
        this._container.set('class', `${this._container.get('class')} ia-shape ia-shape-${this._name}`);
        this._canvas.appendChild(this.container.el);
    }

    onActivated() {
        this._isActive = true;
    }

    onDeactivated() {
        this._isActive = false;
    }

    onCanvasClick(x, y) {}
    onCanvasMouseMove(x, y) {}
    onCanvasKeyPressed(key) {}

}