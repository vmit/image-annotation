/**
 * This class wraps communication with particular shape editor about its controls.
 * List of controls can be changed ("shape:editor:controls:change" event).
 */
export default class ShapeEditorControls {
    constructor(shapeEditor, container) {
        this._shapeEditor = shapeEditor;
        this._container = container;
        this._el = document.createElement('div');
        this._el.setAttribute('class', 'image-annotation-editor__tools-group image-annotation-editor__shape-controls');

        shapeEditor.on('shape:editor:controls:change', this._onControlsChange = (controls) => this._renderControls(controls));

        this._renderControls(shapeEditor.controls);
    }

    /**
     * Removes itself from container and stops listening to shape editor "shape:editor:controls:change".
     */
    remove() {
        this._removeFromContainer();
        this._shapeEditor.removeListener('shape:editor:controls:change', this._onControlsChange);
    }

    _addToContainer() {
        if (!this._container.contains(this._el)) {
            this._container.appendChild(this._el);
        }
    }

    _removeFromContainer() {
        if (this._container.contains(this._el)) {
            this._container.removeChild(this._el);
        }
    }

    _renderControls(controls) {
        while(this._el.hasChildNodes()) {
            this._el.removeChild(this._el.lastChild);
        }

        controls.forEach((control) => {
            const controlElement = document.createElement('div');
            controlElement.setAttribute('class', `image-annotation-editor__font-icon`);
            controlElement.innerHTML = `${control.title}`;
            controlElement.addEventListener('click', control.action);

            this._el.appendChild(controlElement);
        });

        if (controls.length > 0) {
            this._addToContainer();
        } else {
            this._removeFromContainer();
        }
    }
}