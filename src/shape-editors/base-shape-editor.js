import EventEmitter from 'events';
import SvgGroup from '../utils/svg/svg-g';
import ThrottledProvider from '../utils/throttled-provider';
import assert from '../utils/assert';
import throttle from 'lodash/throttle';

/**
 * Base class for shape editing.
 *
 * Subclasses should emit the following events:
 *   'shape:editor:activate' - on activation of the editor, e.g. click on its point
 *   'shape:editor:focus' - a lighter version of 'shape:editor:activate', could be emitted on hover
 *   'shape:editor:update' - when editing shape was updated
 *   'shape:editor:remove' - when editing shape was removed
 *
 * @abstract
 */
export default class BaseShapeEditor extends EventEmitter {
    get container() { return this._container; }
    get shape() { return this._shape; }
    get canvas() { assert(this._canvas, 'the editor is not rendered, forgot to call parent\'s render()?'); return this._canvas; }
    get canvasSizeProvider() { return this._canvasPositionProvider; }
    get canvasSize() { return this.canvasSizeProvider.get(); }
    get id() { return this._id || (this._id = `shape-editor_` + Math.random()); }
    get controls() { return this._controls; }
    set controls(controls) {
        this._controls = controls;
        this.emit('controls:change', controls);
    }

    /**
     * @param {Shape} shape
     * @param {string} [name=shape.type]
     */
    constructor(shape, name=shape.type) {
        super();

        this._shape = shape;
        this._name = name;
        this._isActive = false;
        this._canvasPositionProvider = new ThrottledProvider(() => this.canvas.getBoundingClientRect());
        this._controls = [];
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
        this._container = new SvgGroup(this._canvasSize);
        this._container.set('class', `${this._container.get('class')} ia-shape ia-shape-${this._name}`);
        this._canvas.appendChild(this.container.el);
        this._container.el.addEventListener('mouseenter', throttle(this.emit.bind(this, 'shape:editor:focus', this), 100, { trailing: false }))
    }

    rerender() {
        this._canvasPositionProvider.reset();
    }

    onActivated() {
        this._isActive = true;
    }

    onDeactivated() {
        this._isActive = false;
    }

    onCanvasKeyPressed(key) {}

}