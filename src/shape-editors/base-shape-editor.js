import EventEmitter from 'events';
import SvgGroup from '../utils/svg/svg-g';
import ThrottledProvider from '../utils/throttled-provider';
import assert from '../utils/assert';
import throttle from 'lodash/throttle';

/**
 * Base class for shape editors. It creates the base container element, and all the other
 * elements in descendants should be placed here.
 *
 * Emits the following events:
 *   'shape:editor:activate' - on activation of the editor, e.g. click on its point
 *   'shape:editor:focus' - a lighter version of 'shape:editor:activate', could be emitted on hover
 *   'shape:editor:update' - when editing shape was updated
 *   'shape:editor:remove' - when editing shape was removed
 *   'shape:editor:controls:change' - when the list of controls is changed
 *
 * @abstract
 */
export default class BaseShapeEditor extends EventEmitter {
    get container() { return this._container; }
    get shape() { return this._shape; }
    get canvas() { assert(this._canvas, 'the editor is not rendered, forgot to call parent\'s render()?'); return this._canvas; }
    get canvasSizeProvider() { return this._canvasSizeProvider; }
    get canvasSize() { return this.canvasSizeProvider.get(); }
    get id() { return this._id || (this._id = `shape-editor_` + Math.random()); }
    get controls() { return this._controls; }
    set controls(controls) { this.emit('shape:editor:controls:change', this._controls = controls); }

    /**
     * @param {Shape} shape
     * @param {string} [name=shape.type]
     */
    constructor(shape, name=shape.type) {
        super();

        this._shape = shape;
        this._name = name;
        this._isActive = false;
        this._canvasSizeProvider = new ThrottledProvider(() => this.canvas.getBoundingClientRect());
        this._container = this._createContainer(this._canvasSizeProvider, this._name);
        this._controls = [];
        this._canvas = null;
    }

    /**
     * Appends passed element to the main container.
     *
     * @param {BaseSvgElementWrapper} element
     */
    append(element) {
        this.container.el.appendChild(element.el);
    }

    /**
     * Removes passed element from the main container.
     *
     * @param {BaseSvgElementWrapper} element
     */
    remove(element) {
        this.container.el.removeChild(element.el);
    }

    /**
     * Removes itself from the canvas it was rendered into.
     */
    removeFromCanvas() {
        this.canvas.removeChild(this.container.el);
        this._canvas = null;
        this.emitRemove();
    }

    /**
     * Sets up shape editor interface (all the required elements and listeners) and puts it into canvas.
     * It's supposed to be called only once during shape editor's lifecycle. Use {@link this.rerender} to update elements.
     * Required to be called in descendant's overrides.
     *
     * @param {HTMLCanvasElement} canvas
     */
    render(canvas) {
        assert(this._canvas !== canvas, 'Shape editor must not be rendered into the same canvas again');

        this._canvas = canvas;
        this._canvas.appendChild(this.container.el);
    }

    /**
     * Updates current interface elements.
     */
    rerender() {
        this._canvasSizeProvider.reset();
    }

    isNewShape() {
        return false;
    }

    /**
     * Called by the annotation editor when this editor is activated (gets user's focus).
     */
    onActivated() {
        this._isActive = true;
    }

    /**
     * Called by the annotation editor when this editor is deactivated (looses user's focus).
     */
    onDeactivated() {
        this._isActive = false;
    }

    /**
     * Keyboard event listeners are set in this base class on the main container.
     *
     * @param {string} key - {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key}
     * @param {boolean} altKey
     * @param {boolean} shiftKey
     */
    onKeyPressed(key, altKey, shiftKey) {
        switch (key) {
            case 'D':
                this.removeFromCanvas();
                break;
        }
    }

    /**
     * Emits 'shape:editor:activate' event outside to show desire to be activated. However it is up to the
     * annotation editor to activate it not (and notify this editor by {@link this.onActivated}).
     * Emitted only it the editor is not yet active.
     */
    emitActivate() {
        if (!this._isActive) {
            this.emit('shape:editor:activate', this);
        }
    }

    /**
     * Emits 'shape:editor:focus' event. Should be called when the editor is focused.
     */
    emitFocus() {
        this.emit('shape:editor:focus', this);
    }

    /**
     * Emits 'shape:editor:update' event. Should be called when the shape was updated.
     */
    emitUpdate() {
        this.emit('shape:editor:update', this.shape);
    }

    /**
     * Emits 'shape:editor:update' event. Should be called when the shape was removed.
     */
    emitRemove() {
        this.emit('shape:editor:remove', this);
    }

    /**
     * Utility method for the main container creation.
     *
     * @param {Provider<CanvasSize>} canvasSizeProvider
     * @param {string} name
     * @private
     */
    _createContainer(canvasSizeProvider, name) {
        const container = new SvgGroup(canvasSizeProvider);
        container.set('tabindex', 0); // to be able to receive keyboard events
        container.addClass('ia-shape');
        container.addClass(`ia-shape-${name}`);
        container.el.addEventListener('mouseenter', throttle(this.emit.bind(this, 'shape:editor:focus', this), 100, { trailing: false }));
        container.el.addEventListener('keydown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let key = e.key;
            // letter keys
            if (e.keyCode > 64 && e.keyCode < 91) {
                key = String.fromCharCode(e.keyCode);
            }

            this.onKeyPressed(key, e.altKey, e.shiftKey);
        });

        return container;
    }

}
