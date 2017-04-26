import '../data-types/shape';
import PolygonEditor from './polygon-editor';
import NewPolygonEditor from './new-polygon-editor';

/**
 * Shape editors factory. Creates two types of editors: "finished" (subclasses of {@class BaseShapeEditor}) and
 * "new" (subclasses of {@class BaseNewShapeEditor}) ones.
 */
export default class ShapeEditorFactory {
    /**
     * @param {Object} [editors] - <type> => <shape editor class> map
     * @param {Object} [newEditors] - <type> => <new shape editor class> map
     */
    constructor(editors = {
        'polygon': PolygonEditor
    }, newEditors = {
        'polygon': NewPolygonEditor
    }) {
        this._editors = editors;
        this._newEditors = newEditors
    }

    /**
     * Creates a shape editor according to shape's type.
     *
     * @param {Shape} shape
     * @return {BaseShapeEditor} an instance of {@class BaseShapeEditor} subclass
     */
    createEditor(shape) {
        const ShapeEditorClass = this._getShapeClass(shape.type, this._editors);
        return ShapeEditorClass && new ShapeEditorClass(shape);
    }

    /**
     * Creates a "new" shape editor according to shape's type.
     *
     * @param {string} type
     * @return {BaseNewShapeEditor} an instance of {@class BaseNewShapeEditor} subclass
     */
    createNewEditor(type) {
        const ShapeEditorClass = this._getShapeClass(type, this._newEditors);
        return ShapeEditorClass && new ShapeEditorClass();
    }

    _getShapeClass(type, storage) {
        const ShapeEditorClass = storage[type];

        if (!ShapeEditorClass) {
            console.warn(`Unknown shape type: ${type}`);
            return;
        }

        return ShapeEditorClass;
    }
}
