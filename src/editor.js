import './styles/editor.css';
import './styles/canvas.svg.css';
import './styles/shapes.svg.css';
import './data-types/shape';
import editorMarkup from './editor.html';
import EventEmitter from 'events';
import assert from './utils/assert';
import Keys from './utils/keys';
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
        this._zoomValue = null;
        this._canvasPositionProvider = new ThrottledProvider(() => this._el.canvas.getBoundingClientRect());
    }

    showAnnotation(shape, options) {
        // annotation could not be provided, and nothing to show in that case
        if (this._annotationInterface) {
            const shapeEditor = this._shapeEditors[this._shapes.indexOf(shape)];
            assert(shapeEditor, 'Corresponding shape editor not found, make sure you passed existing shape.');

            this._annotationInterface.show(this._el.annotationInterface, shapeEditor, options);
        }
    }

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
        this._el.zoomIn.addEventListener('click', (e) => this._zoom(Math.round(this._zoomValue * 1.15)));
        this._el.zoomOut.addEventListener('click', (e) => this._zoom(Math.round(this._zoomValue / 1.15)));
        this._el.annotationLayer.addEventListener('click', (e) => this._annotationInterface && !this._annotationInterface.isChild(e.target) && this.hideAnnotation());
        this._el.newShapes.polygon.addEventListener('click', () => this._appendNewShapeEditor(this._shapeEditorFactory.createNewEditor('polygon')));

        this._el.canvas.addEventListener('keydown', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            let key = Keys.fromKeyCode(e.keyCode);
            key && activeShapeEditor.onCanvasKeyPressed(key);
        }));

        this._el.image.src = this._imageUrl;
        this._zoom(100);
    }

    _renderShapes() {
        this._el.canvas.textContent = '';
        this._shapes.forEach((shape) => this._appendShapeEditor(this._shapeEditorFactory.createEditor(shape)));
    }

    _appendShapeEditor(shapeEditor) {
        this._shapeEditors.push(shapeEditor);

        shapeEditor.render(this._el.canvas);
        shapeEditor.on('shape:editor:activate', this._onShapeActivate.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:update', this._onShapeUpdate.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:remove', this._onShapeRemove.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:focus', this._onShapeFocus.bind(this, shapeEditor));
    }

    _appendNewShapeEditor(newShapeEditor) {
        this._shapeEditors.push(newShapeEditor);

        newShapeEditor.render(this._el.canvas);
        newShapeEditor.on('new:shape:editor:create', this._onShapeCreate.bind(this));
        newShapeEditor.on('new:shape:editor:cancel', this._onShapeCancel.bind(this));

        this._activateShapeEditor(newShapeEditor);
        this._setNewShapeMode(newShapeEditor.shape.type);

        this.emit('shape:start');
    }

    _activateShapeEditor(shapeEditor) {
        this._activeShapeEditor = shapeEditor;
        // emitting must be here (not at the end of the method) because subsequent code depends on it
        this.emit('shape:editor:activated', shapeEditor);

        if (this._el.shapeControls) {
            this._el.shapeControls.remove();
            this._el.shapeControls = null;
        }

        if (shapeEditor != null) {
            this._el.shapeControls = new Editor.ShapeControls(shapeEditor, this._el.tools);

            shapeEditor.onActivated();
            this.once('shape:editor:activated', () => shapeEditor.onDeactivated());
        }
    }

    _withActiveShapeEditor(cb) {
        this._activeShapeEditor && cb(this._activeShapeEditor);
    }

    _setNewShapeMode(type) {
        if (this._el.newShapes.__active__) {
            this._el.newShapes.__active__.classList.remove('image-annotation-editor__shape_active');
        }
        if (this._el.newShapes.__active__ = this._el.newShapes[type]) {
            this._el.newShapes.__active__.classList.add('image-annotation-editor__shape_active');
        }
    }

    _zoom(value) {
        // min/max scale: 10%/1000%
        if (value >= 10 && value <= 1000) {
            this._zoomValue = value;
            this._el.container.style.width = `${value}%`;
            this._shapeEditors.forEach((shapeEditor) => shapeEditor.rerender());
            this.hideAnnotation();
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

Editor.ShapeControls = class {
    constructor(shapeEditor, container) {
        this._shapeEditor = shapeEditor;
        this._container = container;
        this._el = document.createElement('div');
        this._el.setAttribute('class', 'image-annotation-editor__tools-group image-annotation-editor__shape-controls');

        shapeEditor.on('controls:change', this._onControlsChange = (controls) => this._renderControls(controls));

        this._renderControls(shapeEditor.controls);
    }

    remove() {
        this._removeFromContainer();
        this._shapeEditor.removeListener('controls:change', this._onControlsChange);
    }

    _addToContainer() {
        if (!this._container.contains(this._el)) {
            this._container.appendChild(this._el);
        }
    }

    _removeFromContainer() {
        if (this._container.contains(this._el)) {
            this._container.removeChild(this._el);
        }
    }

    _renderControls(controls) {
        while(this._el.hasChildNodes()) {
            this._el.removeChild(this._el.lastChild);
        }

        controls = controls.filter((control) => !control.hidden);

        controls.forEach((control) => {
            const controlElement = document.createElement('div');
            controlElement.setAttribute('class', `image-annotation-editor__font-icon`);
            controlElement.innerHTML = `${control.title}`;
            controlElement.addEventListener('click', control.action);

            this._el.appendChild(controlElement);
        });

        if (controls.length > 0) {
            this._addToContainer();
        } else {
            this._removeFromContainer();
        }
    }
}