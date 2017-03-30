import editorMarkup from './editor.html';
import Keys from './utils/keys';
import {PolygonEditor, NewPolygonEditor} from './shape-editors/polygon-editor';
import './styles/editor.css';
import './styles/shapes.svg.css';


const SHAPE_EDITORS = {
    polygon: PolygonEditor
}


export default class Editor {
    constructor(shapes = []) {
        this._el = {};
        this._shapes = shapes;
        this._activeShapeEditor = null;
    }

    onNewShape(shape) {
        this._activeShapeEditor = null;
        this._shapes.push(shape);
        this.renderShape(shape);
    }

    renderInto(container) {
        container.innerHTML = editorMarkup;

        this._el.canvas = container.querySelector('.image-annotation-editor__canvas');
        this._el.polygon = container.querySelector('.image-annotation-editor__shape-polygon');

        this._el.polygon.addEventListener('click', () => {
            this._activeShapeEditor = new NewPolygonEditor(this._el.canvas);
            this._activeShapeEditor.render();
            this._activeShapeEditor.on('shape:new', this.onNewShape.bind(this));
        });

        this._el.canvas.addEventListener('click', (e) => {
            if (this._activeShapeEditor) {
                this._activeShapeEditor.onCanvasClick(e.offsetX, e.offsetY);
            }
        });

        this._el.canvas.addEventListener('mousemove', (e) => {
            if (this._activeShapeEditor) {
                this._activeShapeEditor.onCanvasMouseMove(e.offsetX, e.offsetY);
            }
        });

        this._el.canvas.addEventListener('keydown', (e) => {
            let key;
            if (this._activeShapeEditor && (key = Keys.fromKeyCode(e.keyCode))) {
                this._activeShapeEditor.onCanvasKeyPressed(key);
            }
        });

        this._shapes.forEach((shape) => {
            this.renderShape(shape);
        });
    }

    renderShape(shape) {
        const ShapeEditorClass = SHAPE_EDITORS[shape.type];

        if (!ShapeEditorClass) {
            console.warn(`Unknown shape type: ${shape.type}`);
            return;
        }

        new ShapeEditorClass(this._el.canvas, shape).render();
    }
}