import BaseShapeEditor from '../../src/shape-editors/base-shape-editor';


describe('BaseShapeEditor' , () => {
    let baseShapeEditor;
    let canvas;

    beforeEach(() => {
        baseShapeEditor = new BaseShapeEditor({ type: 'polygon', data: [] });
        canvas = document.createElement('canvas');

        baseShapeEditor.render(canvas);
    });

    it('should call #onKeyPressed() method by keyboard event', () => {
        spyOn(baseShapeEditor, 'onKeyPressed');

        baseShapeEditor.container.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(baseShapeEditor.onKeyPressed).toHaveBeenCalledWith('Enter');

    });

});