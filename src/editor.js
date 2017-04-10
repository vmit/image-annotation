import editorMarkup from './editor.html';
import EventEmitter from 'events';
import Keys from './utils/keys';
import {normalizeX, normalizeY} from './utils/position';
import ThrottledProvider from './utils/throttled-provider';
import shapeEditorFactory from './shape-editors/shape-editor-factory';
import './styles/editor.css';
import './styles/canvas.svg.css';
import './styles/shapes.svg.css';


export default class Editor extends EventEmitter {
    get shapes() {
        return this._shapes;
    }

    constructor(imageUrl, shapes = []) {
        super();

        this._imageUrl = imageUrl;
        this._shapes = shapes;
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
            remove: container.querySelector('.image-annotation-editor__remove'),
            shapeEditorTools: container.querySelector('.image-annotation-editor__tools-group-shape-editor'),
            newShapes: {
                __active__: null,
                polygon: container.querySelector('.image-annotation-editor__shape-polygon')
            }
        };

        this._el.image.addEventListener('load', () => this._renderShapes());
        this._el.zoomIn.addEventListener('click', (e) => this._zoom(Math.round(this._zoomValue * 1.15)));
        this._el.zoomOut.addEventListener('click', (e) => this._zoom(Math.round(this._zoomValue / 1.15)));
        this._el.remove.addEventListener('click', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            activeShapeEditor.onRemove();
        }));

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
        shapeEditor.render(this._el.canvas);
        shapeEditor.on('shape:editor:activate', this._activateShapeEditor.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:remove', this._onRemoveShape.bind(this, shapeEditor));
        shapeEditor.on('shape:editor:updated', this.emit.bind(this, 'shapes:updated', this.shapes));
    }

    _appendNewShapeEditor(newShapeEditor) {
        newShapeEditor.render(this._el.canvas);
        newShapeEditor.on('shape:new', this._onNewShape.bind(this));
        newShapeEditor.on('shape:cancel', this._onCancelShape.bind(this));
        this._activateShapeEditor(newShapeEditor);
        this._setNewShapeMode(newShapeEditor.shape.type);
    }

    _activateShapeEditor(shapeEditor) {
        this._activeShapeEditor = shapeEditor;
        this.emit('shape:editor:activated', shapeEditor);

        if (shapeEditor != null) {
            shapeEditor.onActivated();
            this.once('shape:editor:activated', () => shapeEditor.onDeactivated());
            this._el.shapeEditorTools.classList.add('image-annotation-editor__tools-group-shape-editor_active');
        } else {
            this._el.shapeEditorTools.classList.remove('image-annotation-editor__tools-group-shape-editor_active');
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
            this._activateShapeEditor(null);
            this._renderShapes();
        }
    }

    _onNewShape(shape) {
        this._activateShapeEditor(null);
        this._setNewShapeMode(null);
        this._shapes.push(shape);
        this._appendShapeEditor(shapeEditorFactory.createEditor(shape));
        this.emit('shapes:updated', this.shapes);
    }

    _onCancelShape(shape) {
        this._activateShapeEditor(null);
        this._setNewShapeMode(null);
    }

    _onRemoveShape(shape) {
        this._activateShapeEditor(null);
    }
}