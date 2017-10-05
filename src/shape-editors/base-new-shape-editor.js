import BaseShapeEditor from './base-shape-editor';
import BaseSvgElementWrapper from '../utils/svg/base-svg-element-wrapper';


class SvgOverlay extends BaseSvgElementWrapper {
    constructor(canvasSizeProvider) {
        super('rect', canvasSizeProvider, 'new-shape-overlay');

        this.set('width', '100%');
        this.set('height', '100%');
    }
}

/**
 * Base class for creating a new shape. Creating "new" shapes is a different UX from "existing" ones,
 * that is why they have separate branch.
 *
 * Subclasses should emit the following events:
 *   'new:shape:editor:create' - when editing shape is finished
 *   'new:shape:editor:cancel' - when editing shape is canceled
 */
export default class BaseNewShapeEditor extends BaseShapeEditor {
    get overlay() { return this._overlay; }

    isNewShape() {
        return true;
    }

    onDeactivated() {
        super.onDeactivated();

        this.removeFromCanvas();
    }

    render(canvas) {
        super.render(canvas);

        this.append(this._overlay = new SvgOverlay(this.canvasSizeProvider));
    }

}
