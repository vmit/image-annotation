import { noop } from 'node-noop';
import ShapeEditorControls from '../src/editor__shape-editor-controls';
import BaseShapeEditor from '../src/shape-editors/base-shape-editor';
import { BackControlDescription as Back, RemoveControlDescription as Remove } from '../src/shape-editors/base-shape-editor__controls';


describe('Editor`s ShapeControls' , () => {
    let shapeEditorControls;
    let shapeEditor;
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        shapeEditor = new BaseShapeEditor({ type: 'polygon', data: [], annotation: {}});
        shapeEditor.controls = [new Back(noop), new Remove(noop)];
        shapeEditorControls = new ShapeEditorControls(shapeEditor, container);
    });

    it('should render an icon per control', () => {
        expect(container.querySelectorAll('.image-annotation-editor__font-icon').length).toBe(2);
    });

    it('should rerender when controls change', () => {
        expect(container.querySelectorAll('.image-annotation-editor__font-icon').length).toBe(2);
        shapeEditor.controls = [new Back(noop)];
        expect(container.querySelectorAll('.image-annotation-editor__font-icon').length).toBe(1);
    });

    it('should remove itself from container by remove()', () => {
        expect(container.childNodes.length).toBeGreaterThan(0);
        shapeEditorControls.remove();
        expect(container.childNodes.length).toBe(0);
    });

});