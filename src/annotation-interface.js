import BaseShapeEditor from '../src/shape-editors/base-shape-editor';

/**
 * Shapes can be annotated with arbitrary data. How to do it should be defined by the client (who knows what
 * the shapes could mean), e.g. it could be just a dropdown with object types (a man, a cat or a road) or something
 * very complex with a lot of options to specify.
 * This class implements only showing the editor along the shape, the editor actually is a DOM node created in
 * #createInterfaceElement(). Annotation data should be stored in shape's "annotation" property.
 *
 * Instance of this class is supposed to be reused, that is why it has two mandatory methods to implement:
 *   #createInterfaceElement() - to create editor's DOM node
 *   #onShow(shape, options) - to bring the editor in appropriate state.
 *
 * @abstract
 */
export default class AnnotationInterface {
    get SHAPE_PADDING_PX() { return 10; }
    get el() { return this._el; }

    constructor() {
        this._isVisible = false;
        this._el = null;
        this._container = null;
    }

    /**
     * Appends annotation editor into provided container and set its position. It is supposed to be called from
     * the image annotation editor that has the container.
     *
     * @param {HTMLElement} container
     * @param {BaseShapeEditor} shapeEditor
     * @param {*} [options]
     */
    show(container, shapeEditor, options={}) {
        if (this._container !== container) {
            this._container = container;
            container.appendChild(this._el = this.createInterfaceElement());
        }

        if (this._shapeEditor !== shapeEditor) {
            const bBox = shapeEditor.container.el.getBBox();

            // hide and show in setTimeout() to make some animation
            this.hide();
            setTimeout(() => container.classList.add('image-annotation-editor__annotation-interface_visible'), 100);

            const overlay = container.parentNode;
            let shapeBottomPosition = bBox.y + bBox.height + this.SHAPE_PADDING_PX;
            if (shapeBottomPosition > (overlay.scrollTop + overlay.offsetHeight)) {
                container.style.top = `auto`;
                container.style.bottom = `${-overlay.scrollTop + this.SHAPE_PADDING_PX}px`;
            } else {
                container.style.top = `${shapeBottomPosition}px`;
                container.style.bottom = `auto`;
            }

            let shapeLeftPosition = bBox.x;
            if (shapeLeftPosition < overlay.scrollLeft) {
                shapeLeftPosition = overlay.scrollLeft + this.SHAPE_PADDING_PX;
            }
            container.style.left = `${shapeLeftPosition}px`;

            this._isVisible = true;
            this._shapeEditor = shapeEditor;
            this.onShow(shapeEditor.shape, shapeEditor.container.el, options);
        }

    }

    /**
     * Hides annotation editor.
     */
    hide() {
        this._container.classList.remove('image-annotation-editor__annotation-interface_visible');
        this._container.style.top = '-1000px';
        this._isVisible = false;
        this._shapeEditor = null;
    }

    /**
     * Responds if provided DOM element is a child of current annotation/shape editor.
     * E.g. could be useful to find out is clicked target element belongs to current active shape.
     *
     * @param {HTMLElement} element
     * @return {boolean}
     */
    isChild(element) {
        const isShapeEditorChild = !!this._shapeEditor && this._shapeEditor.container.el.contains(element);
        const isInterfaceChild = !!this._container && this._container.contains(element);

        return isShapeEditorChild || isInterfaceChild;
    }

    /**
     * @return {boolean}
     */
    isVisible() {
        return this._isVisible;
    }

    /**
     * Method is called to create DOM element of the annotation editor. No default implementation,
     * must be implemented by subclass.
     *
     * @abstract
     * @return {HTMLElement}
     */
    createInterfaceElement() {
        throw new Error('#createInterfaceElement() should be overridden');
    }

    /**
     * Called just before showing the editor. This method is aimed to bring the editor in appropriate state,
     * according to current shape and options.
     * No default implementation, must be implemented by subclass.
     *
     * @param {Shape} shape
     * @param {HTMLElement} shapeElement
     * @param {*} options
     */
    onShow(shape, shapeElement, options) {
        throw new Error('#onShow(shape, shapeElement, options) should be overridden');
    }
}
