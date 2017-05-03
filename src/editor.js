import './styles/editor.css';
import './styles/canvas.svg.css';
import './styles/shapes.svg.css';
import './data-types/shape';
import editorMarkup from './editor.html';
import EventEmitter from 'events';
import assert from './utils/assert';
import ShapeControls from './editor__shape-editor-controls';
import ThrottledProvider from './utils/throttled-provider';
import ShapeEditorFactory from './shape-editors/shape-editor-factory';


/**
 * This class wraps all the functionality of image annotation and basically is the main interface for clients.
 * After creation it should be rendered into container DOM element. Container's content will be <b>replaced</b>
 * with editor's markup.
 *
 * @example
 * let editor = new Editor('http://example.com/iamge.png', [<already created shapes if any>]);
 * let container = document.getElementById('annotation-editor');
 * editor.render(container);
 */
export default class Editor extends EventEmitter {
    get shapes() { return this._shapes; }
    set annotationInterface(annotationInterface) {
        this._annotationInterface = annotationInterface;
    }

    /**
     * @return {number} - zoom level in percentages
     */
    get zoom() { return this._zoom; }

    /**
     * @param {number} zoom - level in percentages, min: 20%, max: 1000%, the value is clamped
     */
    set zoom(zoom) {
        this._zoom = Math.min(Math.max(zoom, 20), 1000);
        this._el.container.style.width = `${this._zoom}%`;
        this._shapeEditors.forEach((shapeEditor) => shapeEditor.rerender());
        this.hideAnnotation();
    }

    /**
     * @param {string} imageUrl - URL of the image to be annotated
     * @param {Array<Shape>} [shapes=[]] - list of already created shapes
     * @param {ShapeEditorFactory} [shapeEditorFactory=new ShapeEditorFactory()]
     */
    constructor(imageUrl, shapes = [], shapeEditorFactory = new ShapeEditorFactory()) {
        super();

        this._imageUrl = imageUrl;
        this._shapes = shapes;
        this._shapeEditorFactory = shapeEditorFactory;
        this._shapeEditors = [];
        this._annotationInterface = null;
        this._activeShapeEditor = null;
        this._canvasSizeProvider = new ThrottledProvider(() => this._el.canvas.getBoundingClientRect());
    }

    /**
     * Shows annotation interface (its DOM elements).
     *
     * @param {Shape} shape - which shape to be annotated, passed to annotation interface
     * @param {*} [options] - arbitrary options to pass to annotation interface
     */
    showAnnotation(shape, options) {
        // annotation could not be provided, and nothing to show in that case
        if (this._annotationInterface) {
            const shapeEditor = this._shapeEditors[this._shapes.indexOf(shape)];
            assert(shapeEditor, 'Corresponding shape editor not found, make sure you passed existing shape.');

            this._annotationInterface.show(this._el.annotationInterface, shapeEditor, options);
        }
    }

    /**
     * Hides annotation interface (its DOM elements).
     */
    hideAnnotation() {
        if (this._annotationInterface && this._annotationInterface.isVisible()) {
            this._annotationInterface.hide();
        }
    }

    render(container) {
        container.innerHTML = editorMarkup;

        this._el = {
            image: container.querySelector('.image-annotation-editor__image'),
            container: container.querySelector('.image-annotation-editor__canvas-container'),
            canvas: container.querySelector('.image-annotation-editor__canvas'),
            annotationLayer: container.querySelector('.image-annotation-editor__annotation-layer'),
            annotationInterface: container.querySelector('.image-annotation-editor__annotation-interface'),
            zoomIn: container.querySelector('.image-annotation-editor__zoom-in'),
            zoomOut: container.querySelector('.image-annotation-editor__zoom-out'),
            tools: container.querySelector('.image-annotation-editor__tools'),
            shapeControls: null,
            newShapes: {
                __active__: null,
                polygon: container.querySelector('.image-annotation-editor__shape-polygon')
            }
        };

        this._el.image.addEventListener('load', () => { this._renderShapes(); this.emit('image:load'); });
        this._el.zoomIn.addEventListener('click', (e) => this.zoom *= 1.15);
        this._el.zoomOut.addEventListener('click', (e) => this.zoom /= 1.15);
        this._el.annotationLayer.addEventListener('click', (e) => this._annotationInterface && !this._annotationInterface.isChild(e.target) && this.hideAnnotation());
        this._el.newShapes.polygon.addEventListener('click', () => this._appendNewShapeEditor(this._shapeEditorFactory.createNewEditor('polygon')));

        this._el.image.src = this._imageUrl;
        this.zoom = 100;
    }

    /**
     * Renders shapes (clears canvas preliminarily).
     *
     * @private
     */
    _renderShapes() {
        this._el.canvas.textContent = '';
        this._shapes.forEach((shape) => this._appendShapeEditor(this._shapeEditorFactory.createEditor(shape)));
    }

    /**
     * Renders shape editor on canvas.
     *
     * @param {BaseShapeEditor} shapeEditor
     * @private
     */
    _appendShapeEditor(shapeEditor) {
        this._shapeEditors.push(shapeEditor);

        shapeEditor.render(this._el.canvas);
        shapeEditor.on('shape:editor:activate', this._onShapeActivate.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:update', this._onShapeUpdate.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:remove', this._onShapeRemove.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:focus', this._onShapeFocus.bind(this, shapeEditor));
    }

    /**
     * Renders new shape editor on canvas.
     *
     * @param {BaseNewShapeEditor} newShapeEditor
     * @private
     */
    _appendNewShapeEditor(newShapeEditor) {
        this._shapeEditors.push(newShapeEditor);

        newShapeEditor.render(this._el.canvas);
        newShapeEditor.on('new:shape:editor:create', this._onShapeCreate.bind(this));
        newShapeEditor.on('new:shape:editor:cancel', this._onShapeCancel.bind(this));

        this._activateShapeEditor(newShapeEditor);
        this._setNewShapeMode(newShapeEditor.shape.type);

        this.emit('shape:start');
    }

    /**
     * Activates shape editor. Activation means settings context specific controls thus
     * visually making shape editor "current" for the user.
     *
     * @param {BaseShapeEditor} shapeEditor
     * @private
     */
    _activateShapeEditor(shapeEditor) {
        this._activeShapeEditor = shapeEditor;
        // emitting must be here (not at the end of the method) because subsequent code depends on it
        this.emit('shape:editor:activated', shapeEditor);

        if (this._el.shapeControls) {
            this._el.shapeControls.remove();
            this._el.shapeControls = null;
        }

        if (shapeEditor != null) {
            this._el.shapeControls = new ShapeControls(shapeEditor, this._el.tools);

            shapeEditor.onActivated();
            this.once('shape:editor:activated', () => shapeEditor.onDeactivated());
        }
    }

    /**
     * Make shape icon "active" thus indicating the context for the user.
     *
     * @param {string} type - supported shape type
     * @private
     */
    _setNewShapeMode(type) {
        if (this._el.newShapes.__active__) {
            this._el.newShapes.__active__.classList.remove('image-annotation-editor__shape_active');
        }
        if (this._el.newShapes.__active__ = this._el.newShapes[type]) {
            this._el.newShapes.__active__.classList.add('image-annotation-editor__shape_active');
        }
    }

    /**
     * @param {BaseShapeEditor} shapeEditor
     * @private
     */
    _onShapeActivate(shapeEditor) {
        this._activateShapeEditor(shapeEditor);
    }

    /**
     * @param {BaseShapeEditor} shapeEditor
     * @private
     */
    _onShapeUpdate(shapeEditor) {
        this.emit('shapes:update', this.shapes);
    }

    /**
     * @param {BaseShapeEditor} shapeEditor
     * @private
     */
    _onShapeFocus(shapeEditor) {
        this.showAnnotation(shapeEditor.shape);
    }

    /**
     * @param {BaseNewShapeEditor} newShapeEditor
     * @private
     */
    _onShapeCreate(newShapeEditor) {
        // "new" editor is on the top, and should be removed
        this._shapeEditors.pop();

        this._activateShapeEditor(null);
        this._setNewShapeMode(null);
        this._shapes.push(newShapeEditor.shape);
        this._appendShapeEditor(this._shapeEditorFactory.createEditor(newShapeEditor.shape));

        this.showAnnotation(newShapeEditor.shape);

        this.emit('shape:finish', newShapeEditor.shape);
        this.emit('shapes:update', this.shapes);
    }

    /**
     * @param {BaseNewShapeEditor} newShapeEditor
     * @private
     */
    _onShapeCancel(newShapeEditor) {
        // "new" editor is on the top, and should be removed
        this._shapeEditors.pop();

        this._activateShapeEditor(null);
        this._setNewShapeMode(null);

        this.emit('shape:cancel', newShapeEditor.shape);
    }

    /**
     * @param {BaseShapeEditor} shapeEditor
     * @private
     */
    _onShapeRemove(shapeEditor) {
        this._activateShapeEditor(null);
        this.hideAnnotation();
        this._shapes.splice(this._shapes.indexOf(shapeEditor.shape), 1);
        this._shapeEditors.splice(this._shapeEditors.indexOf(shapeEditor), 1);

        this.emit('shape:remove', shapeEditor.shape);
        this.emit('shapes:update', this.shapes);
    }
}
