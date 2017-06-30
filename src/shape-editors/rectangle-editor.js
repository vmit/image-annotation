import BaseShapeEditor from './base-shape-editor';


export default class RectangleEditor extends BaseShapeEditor {

    /**
     * @param {Shape} shape
     * @param {string} [name=shape.type]
     */
    constructor(shape, name=shape.type) {
        super(shape, name);
    }

    render(canvas) {
        super.render(canvas);

    }

}