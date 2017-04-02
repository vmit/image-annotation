import PolygonEditor from './polygon-editor';
import NewPolygonEditor from './new-polygon-editor';

export default {
    editors: {
        'polygon': PolygonEditor
    },
    newEditors: {
        'polygon': NewPolygonEditor
    },

    createEditor(shape) {
        const ShapeEditorClass = this._getShapeClass(shape.type, this.editors);
        return ShapeEditorClass && new ShapeEditorClass(shape);
    },

    createNewEditor(type) {
        const ShapeEditorClass = this._getShapeClass(type, this.newEditors);
        return ShapeEditorClass && new ShapeEditorClass();
    },

    _getShapeClass(type, storage) {
        const ShapeEditorClass = storage[type];

        if (!ShapeEditorClass) {
            console.warn(`Unknown shape type: ${type}`);
            return;
        }

        return ShapeEditorClass;
    }
}