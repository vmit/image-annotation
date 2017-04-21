

export default class AnnotationInterface {
    get SHAPE_PADDING_PX() { return 10; }
    get el() { return this._el; }

    constructor() {
        this._isVisible = false;
        this._el = null;
        this._container = null;
    }

    show(container, shapeEditor, options) {
        if (!this._el) {
            this._container = container;
            this._container = container;
            container.appendChild(this._el = this.createInterfaceElement());
        }

        if (this._shapeEditor !== shapeEditor) {
            const bBox = shapeEditor.container.el.getBBox();
            this.hide();
            setTimeout(() => container.classList.add('image-annotation-editor__annotation-interface_visible'), 100);
            container.style.top = `${bBox.y + bBox.height + this.SHAPE_PADDING_PX}px`;
            container.style.left = `${bBox.x}px`;

            this.onShow(shapeEditor.shape, options);

            this._isVisible = true;
            this._shapeEditor = shapeEditor;
        }

    }

    hide() {
        this._container.classList.remove('image-annotation-editor__annotation-interface_visible');
        this._container.style.top = '-1000px';
        this._isVisible = false;
        this._shapeEditor = null;
    }

    isChild(element) {
        const isShapeEditorChild = this._shapeEditor && this._shapeEditor.container.el.contains(element);
        const isInterfaceChild = this._container && this._container.contains(element);

        return isShapeEditorChild || isInterfaceChild;
    }

    isVisible() {
        return this._isVisible;
    }

    createInterfaceElement() {
        // throw new Error('#createInterfaceElement() should be overridden');

        const tmp = document.createElement('div');
        tmp.innerHTML = 'sdfsd';
        return tmp;
    }

    onShow(shape, options) {
        // throw new Error('#onShow(shape, options) should be overridden');

        this.el.innerHTML = 'ccc: ' + shape.annotation;
        shape.annotation = 'annotated';
    }
}