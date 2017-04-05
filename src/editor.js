import editorMarkup from './editor.html';
import EventEmitter from 'events';
import Keys from './utils/keys';
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
        this._canvasPosition = null;
    }

    render(container) {
        container.innerHTML = editorMarkup;

        this._el = {
            image: container.querySelector('.image-annotation-editor__image'),
            canvas: container.querySelector('.image-annotation-editor__canvas'),
            newShapes: {
                __active__: null,
                polygon: container.querySelector('.image-annotation-editor__shape-polygon')
            }
        };

        this._el.image.addEventListener('load', () => {
            this._shapes.forEach((shape) => this._appendShapeEditor(shapeEditorFactory.createEditor(shape)));
        });

        this._el.newShapes.polygon.addEventListener('click', () => {
            this._appendNewShapeEditor(shapeEditorFactory.createNewEditor('polygon'));
        });

        this._el.canvas.addEventListener('click', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            activeShapeEditor.onCanvasClick(this._clientX2Normalized(e.clientX), this._clientY2Normalized(e.clientY));
        }));

        this._el.canvas.addEventListener('mousemove', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            activeShapeEditor.onCanvasMouseMove(this._clientX2Normalized(e.clientX), this._clientY2Normalized(e.clientY));
        }));

        this._el.canvas.addEventListener('keydown', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            let key = Keys.fromKeyCode(e.keyCode);
            key && activeShapeEditor.onCanvasKeyPressed(key);
        }));

        this._el.image.src = this._imageUrl;
    }

    _appendShapeEditor(shapeEditor) {
        shapeEditor.render(this._el.canvas);
        shapeEditor.on('shape:editor:activate', this._activateShapeEditor.bind(this, shapeEditor));
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
        this._canvasPosition = this._el.canvas.getBoundingClientRect();

        this._activeShapeEditor = shapeEditor;
        this.emit('shape:editor:activated', shapeEditor);

        if (shapeEditor != null) {
            shapeEditor.onActivated();
            this.once('shape:editor:activated', () => shapeEditor.onDeactivated());
        }
    }

    _withActiveShapeEditor(cb) {
        this._activeShapeEditor && cb(this._activeShapeEditor);
    }

    _clientX2Normalized(clientX) {
        return this._roundCoordinate((clientX - this._canvasPosition.left) / this._canvasPosition.width);
    }

    _clientY2Normalized(clientY) {
        return this._roundCoordinate((clientY - this._canvasPosition.top) / this._canvasPosition.height);
    }

    _roundCoordinate(value) {
        return Math.round(value * 100) / 100;
    }

    _setNewShapeMode(type) {
        if (this._el.newShapes.__active__) {
            this._el.newShapes.__active__.classList.remove('image-annotation-editor__shape_active');
        }
        if (this._el.newShapes.__active__ = this._el.newShapes[type]) {
            this._el.newShapes.__active__.classList.add('image-annotation-editor__shape_active');
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
}