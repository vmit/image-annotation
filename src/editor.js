import editorMarkup from './editor.html';
import EventEmitter from 'events';
import Keys from './utils/keys';
import ThrottledProvider from './utils/throttled-provider';
import shapeEditorFactory from './shape-editors/shape-editor-factory';
import './styles/editor.css';
import './styles/canvas.svg.css';
import './styles/shapes.svg.css';


export default class Editor extends EventEmitter {
    get shapes() { return this._shapes; }

    constructor(imageUrl, shapes = []) {
        super();

        this._imageUrl = imageUrl;
        this._shapes = shapes;
        this._shapeEditors = {}; // id => shape editor
        this._activeShapeEditor = null;
        this._zoomValue = null;
        this._canvasPositionProvider = new ThrottledProvider(() => this._el.canvas.getBoundingClientRect());
    }

    render(container) {
        container.innerHTML = editorMarkup;

        this._el = {
            image: container.querySelector('.image-annotation-editor__image'),
            container: container.querySelector('.image-annotation-editor__canvas-container'),
            canvas: container.querySelector('.image-annotation-editor__canvas'),
            zoomIn: container.querySelector('.image-annotation-editor__zoom-in'),
            zoomOut: container.querySelector('.image-annotation-editor__zoom-out'),
            tools: container.querySelector('.image-annotation-editor__tools'),
            shapeControls: null,
            newShapes: {
                __active__: null,
                polygon: container.querySelector('.image-annotation-editor__shape-polygon')
            }
        };

        this._el.image.addEventListener('load', () => this._renderShapes());
        this._el.zoomIn.addEventListener('click', (e) => this._zoom(Math.round(this._zoomValue * 1.15)));
        this._el.zoomOut.addEventListener('click', (e) => this._zoom(Math.round(this._zoomValue / 1.15)));

        this._el.newShapes.polygon.addEventListener('click', () => {
            this._appendNewShapeEditor(shapeEditorFactory.createNewEditor('polygon'));
        });

        this._el.canvas.addEventListener('keydown', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            let key = Keys.fromKeyCode(e.keyCode);
            key && activeShapeEditor.onCanvasKeyPressed(key);
        }));

        this._el.image.src = this._imageUrl;
        this._zoom(100);
    }

    _renderShapes() {
        this._el.canvas.textContent = '';
        this._shapes.forEach((shape) => this._appendShapeEditor(shapeEditorFactory.createEditor(shape)));
    }

    _appendShapeEditor(shapeEditor) {
        this._shapeEditors[shapeEditor.id] = shapeEditor;

        shapeEditor.render(this._el.canvas);
        shapeEditor.on('shape:editor:activate', this._activateShapeEditor.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:remove', this._onRemoveShape.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:updated', this.emit.bind(this, 'shapes:updated', this.shapes));
    }

    _appendNewShapeEditor(newShapeEditor) {
        this._shapeEditors[newShapeEditor.id] = newShapeEditor;

        newShapeEditor.render(this._el.canvas);
        newShapeEditor.on('shape:new', this._onNewShape.bind(this));
        newShapeEditor.on('shape:cancel', this._onCancelShape.bind(this));
        this._activateShapeEditor(newShapeEditor);
        this._setNewShapeMode(newShapeEditor.shape.type);
    }

    _activateShapeEditor(shapeEditor) {
        this._activeShapeEditor = shapeEditor;
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
            for (const id in this._shapeEditors) {
                this._shapeEditors[id].rerender();
            }
        }
    }

    _onNewShape(shapeEditor) {
        delete this._shapeEditors[shapeEditor.id];

        this._activateShapeEditor(null);
        this._setNewShapeMode(null);
        this._shapes.push(shapeEditor.shape);
        this._appendShapeEditor(shapeEditorFactory.createEditor(shapeEditor.shape));
        this.emit('shapes:updated', this.shapes);
    }

    _onCancelShape(shapeEditor) {
        delete this._shapeEditors[shapeEditor.id];

        this._activateShapeEditor(null);
        this._setNewShapeMode(null);
    }

    _onRemoveShape(shapeEditor) {
        delete this._shapeEditors[shapeEditor.id];

        this._activateShapeEditor(null);
        this._shapes.splice(this._shapes.indexOf(shapeEditor.shape), 1);
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