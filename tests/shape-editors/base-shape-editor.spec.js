import BaseShapeEditor from '../../src/shape-editors/base-shape-editor';


describe('BaseShapeEditor' , () => {
    let baseShapeEditor;
    let canvas;

    beforeEach(() => {
        baseShapeEditor = new BaseShapeEditor({ type: 'polygon', data: [] });
        canvas = document.createElement('canvas');

        baseShapeEditor.render(canvas);
    });

    it('should emit all declared events by provided methods', () => {
        const controlsChangeSpy = jasmine.createSpy('controlsChange');
        const activateSpy = jasmine.createSpy('activate');
        const focusSpy = jasmine.createSpy('focus');
        const updateSpy = jasmine.createSpy('update');
        const removeSpy = jasmine.createSpy('remove');

        baseShapeEditor.on('shape:editor:controls:change', controlsChangeSpy);
        baseShapeEditor.on('shape:editor:activate', activateSpy);
        baseShapeEditor.on('shape:editor:focus', focusSpy);
        baseShapeEditor.on('shape:editor:update', updateSpy);
        baseShapeEditor.on('shape:editor:remove', removeSpy);

        baseShapeEditor.controls = [];
        baseShapeEditor.emitActivate();
        baseShapeEditor.emitFocus();
        baseShapeEditor.emitUpdate();
        baseShapeEditor.emitRemove();

        expect(controlsChangeSpy).toHaveBeenCalledWith([]);
        expect(activateSpy).toHaveBeenCalledWith(baseShapeEditor);
        expect(focusSpy).toHaveBeenCalledWith(baseShapeEditor);
        expect(updateSpy).toHaveBeenCalledWith(baseShapeEditor.shape);
        expect(removeSpy).toHaveBeenCalledWith(baseShapeEditor);
    });

    it('should throw exception if the editor is rendered more than once on the same canvas', () => {
        const exceptionHandler = jasmine.createSpy('exceptionHandler');

        try {
            baseShapeEditor.render(canvas);
            baseShapeEditor.render(canvas);
        } catch(e) {
            exceptionHandler(e);
        }

        expect(exceptionHandler).toHaveBeenCalled();
    });

    it('should call #onKeyPressed() method by keyboard event', () => {
        spyOn(baseShapeEditor, 'onKeyPressed');

        baseShapeEditor.container.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(baseShapeEditor.onKeyPressed).toHaveBeenCalledWith('Enter', false, false);

    });

});
