import editorMarkup from './editor.html';
import EventEmitter from 'events';
import Keys from './utils/keys';
import shapeEditorFactory from './shape-editors/shape-editor-factory';
import './styles/editor.css';
import './styles/shapes.svg.css';


export default class Editor extends EventEmitter {
    constructor(shapes = []) {
        super();

        this._el = {};
        this._shapes = shapes;
        this._activeShapeEditor = null;
        this._canvasPosition = null;
    }

    renderInto(container) {
        container.innerHTML = editorMarkup;

        this._el.canvas = container.querySelector('.image-annotation-editor__canvas');
        this._el.polygon = container.querySelector('.image-annotation-editor__shape-polygon');

        this._el.polygon.addEventListener('click', () => {
            this._appendNewShapeEditor(shapeEditorFactory.createNewEditor('polygon'));
        });

        this._el.canvas.addEventListener('click', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            activeShapeEditor.onCanvasClick(e.clientX - this._canvasPosition.left, e.clientY - this._canvasPosition.top);
        }));

        this._el.canvas.addEventListener('mousemove', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            activeShapeEditor.onCanvasMouseMove(e.clientX - this._canvasPosition.left, e.clientY - this._canvasPosition.top);
        }));

        this._el.canvas.addEventListener('keydown', (e) => this._withActiveShapeEditor((activeShapeEditor) => {
            let key = Keys.fromKeyCode(e.keyCode);
            key && activeShapeEditor.onCanvasKeyPressed(key);
        }));

        this._shapes.forEach((shape) => this._appendShapeEditor(shapeEditorFactory.createEditor(shape)));
    }

    _appendShapeEditor(shapeEditor) {
        shapeEditor.render();
        shapeEditor.appendToCanvas(this._el.canvas);
        shapeEditor.on('shape:editor:activate', this._activateShapeEditor.bind(this, shapeEditor));
    }

    _appendNewShapeEditor(newShapeEditor) {
        newShapeEditor.render();
        newShapeEditor.appendToCanvas(this._el.canvas);
        newShapeEditor.on('shape:new', this._onNewShape.bind(this));
        newShapeEditor.on('shape:cancel', this._onCancelShape.bind(this));
        this._activateShapeEditor(newShapeEditor);
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

    _onNewShape(shape) {
        this._activateShapeEditor(null);
        this._shapes.push(shape);
        this._appendShapeEditor(shapeEditorFactory.createEditor(shape));
    }

    _onCancelShape(shape) {
        this._activateShapeEditor(null);
    }
}