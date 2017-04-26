import Editor from '../src/editor';
import ShapeEditorFactory from '../src/shape-editors/shape-editor-factory';


class BaseNewShapeEditorOnSteriods extends ShapeEditorFactory {
    get latestEditor() { return this._latestEditor; }
    get latestNewEditor() { return this._latestNewEditor; }

    createEditor(shape) {
        return this._latestEditor = super.createEditor(shape);
    }

    createNewEditor(type) {
        return this._latestNewEditor = super.createNewEditor(type);
    }
}


function createShape(editor, shapeEditorFactory, type) {
    editor._appendNewShapeEditor(shapeEditorFactory.createNewEditor(type));
    return shapeEditorFactory.latestNewEditor;
}


describe('Editor', () => {
    let editor;
    let imageUrl;
    let shapeEditorFactory;
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        imageUrl = '/base/tests/_assets/penguins.jpg';
        shapeEditorFactory = new BaseNewShapeEditorOnSteriods();
        editor = new Editor(imageUrl, [], shapeEditorFactory);

        spyOn(shapeEditorFactory, 'createNewEditor').and.callThrough();
        spyOn(shapeEditorFactory, 'createEditor').and.callThrough();
        editor.render(container);

        // important for accurate calculation of zoomed image width
        container.style.width = '300px';
        document.body.appendChild(container);
    });


    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should render shapes after successful image loading', (done) => {
        spyOn(editor, '_renderShapes').and.callThrough();

        editor.on('image:load', () => {
            expect(editor._renderShapes).toHaveBeenCalled();
        });

        editor.on('image:load', done);
    });

    it('should add new Polygon shape editor by click on its icon', () => {
        container.querySelector('.image-annotation-editor__shape-polygon').click();

        expect(shapeEditorFactory.createNewEditor).toHaveBeenCalled();
    });

    it('should append new shape from new shape editor', () => {
        container.querySelector('.image-annotation-editor__shape-polygon').click();

        shapeEditorFactory.latestNewEditor.emit('new:shape:editor:create', shapeEditorFactory.latestNewEditor);
        expect(editor.shapes.length).toBe(1);
    });

    it('should not append new shape from canceled new shape editor', () => {
        container.querySelector('.image-annotation-editor__shape-polygon').click();

        shapeEditorFactory.latestNewEditor.emit('new:shape:editor:cancel', shapeEditorFactory.latestNewEditor);
        expect(editor.shapes.length).toBe(0);
    });

    it('should zoom', (done) => {
        editor.on('image:load', () => {
            const image = container.querySelector('.image-annotation-editor__image');
            const initWidth = parseInt(getComputedStyle(image).width);

            expect(editor.zoom).toBe(100);

            editor.zoom = 50;
            expect(editor.zoom).toBe(50);
            expect(parseFloat(getComputedStyle(image).width)).toBe(initWidth * 0.5);

            editor.zoom = 150;
            expect(editor.zoom).toBe(150);
            expect(parseFloat(getComputedStyle(image).width)).toBe(initWidth * 1.5);

            editor.zoom = 10;
            expect(editor.zoom).toBe(20);
            expect(parseFloat(getComputedStyle(image).width)).toBe(initWidth * 0.20);

            editor.zoom = 10000000000;
            expect(editor.zoom).toBe(1000);
            expect(parseFloat(getComputedStyle(image).width)).toBe(initWidth * 10);
        });

        editor.on('image:load', done);

    });


    describe('events', () => {

        it('should listen to shape editor events', (done) => {
            editor = new Editor(imageUrl, [{ type: 'polygon', data: [] }], shapeEditorFactory);
            editor.render(container);

            spyOn(editor, '_onShapeActivate');
            spyOn(editor, '_onShapeUpdate');
            spyOn(editor, '_onShapeRemove');
            spyOn(editor, '_onShapeFocus');

            editor.on('image:load', () => {
                const shapeEditor = shapeEditorFactory.latestEditor;
                shapeEditor.emit('shape:editor:activate', shapeEditor);
                shapeEditor.emit('shape:editor:update', shapeEditor);
                shapeEditor.emit('shape:editor:remove', shapeEditor);
                shapeEditor.emit('shape:editor:focus', shapeEditor);

                expect(editor._onShapeActivate).toHaveBeenCalled();
                expect(editor._onShapeUpdate).toHaveBeenCalled();
                expect(editor._onShapeRemove).toHaveBeenCalled();
                expect(editor._onShapeFocus).toHaveBeenCalled();
            });

            editor.on('image:load', done);
        });

        it('should listen to new shape editor events', (done) => {
            editor = new Editor(imageUrl, [{ type: 'polygon', data: [] }], shapeEditorFactory);
            editor.render(container);

            spyOn(editor, '_onShapeCreate');
            spyOn(editor, '_onShapeCancel');

            editor.on('image:load', () => {
                const newShapeEditor = createShape(editor, shapeEditorFactory, 'polygon');

                newShapeEditor.emit('new:shape:editor:create', newShapeEditor);
                newShapeEditor.emit('new:shape:editor:cancel', newShapeEditor);

                expect(editor._onShapeCreate).toHaveBeenCalled();
                expect(editor._onShapeCancel).toHaveBeenCalled();
            });

            editor.on('image:load', done);
        });

        it('should emit "shape:start", "shape:finish" and "shapes:update" outside', () => {
            const shapeStart = jasmine.createSpy('shape:start');
            const shapeFinish = jasmine.createSpy('shape:finish');
            const shapesUpdate = jasmine.createSpy('shapes:update');

            editor.on('shape:start', shapeStart);
            editor.on('shape:finish', shapeFinish);
            editor.on('shapes:update', shapesUpdate);

            const newShapeEditor = createShape(editor, shapeEditorFactory, 'polygon');
            newShapeEditor.emit('new:shape:editor:create', newShapeEditor);

            expect(shapeStart).toHaveBeenCalled();
            expect(shapeFinish).toHaveBeenCalled();
            expect(shapesUpdate).toHaveBeenCalled();
        });

        it('should emit "shape:finish" and "shapes:update" outside', () => {
            const shapeCancel = jasmine.createSpy('shape:cancel');

            editor.on('shape:cancel', shapeCancel);

            const newShapeEditor = createShape(editor, shapeEditorFactory, 'polygon');
            newShapeEditor.emit('new:shape:editor:cancel', newShapeEditor);

            expect(shapeCancel).toHaveBeenCalled();
        });

        it('should emit "shape:remove" and "shapes:update" outside', (done) => {
            editor = new Editor(imageUrl, [{ type: 'polygon', data: [] }], shapeEditorFactory);
            editor.render(container);

            const shapesUpdate = jasmine.createSpy('shapes:update');
            const shapeRemove = jasmine.createSpy('shape:remove');

            editor.on('shapes:update', shapesUpdate);
            editor.on('shape:remove', shapeRemove);

            editor.on('image:load', () => {
                const shapeEditor = shapeEditorFactory.latestEditor;

                shapeEditor.emit('shape:editor:remove', shapeEditor);

                expect(shapesUpdate).toHaveBeenCalled();
                expect(shapeRemove).toHaveBeenCalled();
            });

            editor.on('image:load', done);
        });
    });


});