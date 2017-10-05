import BaseShapeEditor from '../src/shape-editors/base-shape-editor';
import AnnotationInterface from '../src/annotation-interface';


describe('AnnotationInterface', () => {
    let annotationInterface;
    let containerOverlay;
    let container;
    let annotationEditorElement;
    let canvas;
    let shape;
    let shapeEditor;

    class TestAnnotationInterface extends AnnotationInterface {
        createInterfaceElement() {
            return annotationEditorElement;
        }
        onShow(shape, options) {}
    }

    beforeEach(() => {
        annotationInterface = new TestAnnotationInterface();
        containerOverlay = document.createElement('div');
        document.body.appendChild(containerOverlay);
        container = containerOverlay.appendChild(document.createElement('div'));
        annotationEditorElement = document.createElement('div');
        annotationEditorElement.innerHTML = '<div class="test-div"><input class="test-input"></div>';
        canvas = document.createElement('canvas');
        shape = { type: 'test', data: {}, annotation: '' };
        shapeEditor = new BaseShapeEditor(shape);

        shapeEditor.render(canvas);
    });

    afterEach(() => {
        document.body.removeChild(containerOverlay);
    });

    it('should call createInterfaceElement() on first show', () => {
        spyOn(annotationInterface, 'createInterfaceElement').and.callThrough();

        annotationInterface.show(container, shapeEditor);
        annotationInterface.show(container, shapeEditor);
        annotationInterface.show(container, shapeEditor);

        expect(annotationInterface.createInterfaceElement).toHaveBeenCalledTimes(1);
    });

    it('should call onShow(shape, options)', () => {
        spyOn(annotationInterface, 'onShow').and.callThrough();

        annotationInterface.show(container, shapeEditor);

        expect(annotationInterface.onShow).toHaveBeenCalledWith(shapeEditor.shape, shapeEditor.container.el, {});
    });

    it('should know its children', () => {
        annotationInterface.show(container, shapeEditor);

        expect(annotationInterface.isChild(null)).toBeFalsy();
        expect(annotationInterface.isChild(document.createElement('div'))).toBeFalsy();
        expect(annotationInterface.isChild(annotationEditorElement)).toBeTruthy();
    });

    it('should tell the truth about its visibility', () => {
        expect(annotationInterface.isVisible()).toBeFalsy();

        annotationInterface.show(container, shapeEditor);
        expect(annotationInterface.isVisible()).toBeTruthy();

        annotationInterface.hide(container, shapeEditor);
        expect(annotationInterface.isVisible()).toBeFalsy();
    });

    it('should position container according along the shape editor', () => {
        containerOverlay.style.width = '400px';
        containerOverlay.style.height = '400px';
        spyOn(shapeEditor.container.el, 'getBBox').and.returnValue({ x: 10, y: 10, width: 100, height: 100 });

        annotationInterface.show(container, shapeEditor);

        expect(container.style.top).toBe(`${10 + 100 + annotationInterface.SHAPE_PADDING_PX}px`);
        expect(container.style.left).toBe(`${10}px`);
    });

    it('should position container visible in overlay', () => {
        container.style.width = '1000px';
        container.style.height = '10px';
        containerOverlay.style.width = '200px';
        containerOverlay.style.height = '100px';
        containerOverlay.style.overflow = 'scroll';
        containerOverlay.scrollLeft = 100;
        spyOn(shapeEditor.container.el, 'getBBox').and.returnValue({ x: 10, y: 10, width: 100, height: 100 });

        annotationInterface.show(container, shapeEditor);

        expect(container.style.top).toBe(`auto`);
        expect(container.style.bottom).toBe(`${annotationInterface.SHAPE_PADDING_PX}px`);
        expect(container.style.left).toBe(`${containerOverlay.scrollLeft + annotationInterface.SHAPE_PADDING_PX}px`);
    });

});
