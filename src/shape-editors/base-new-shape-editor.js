import BaseShapeEditor from './base-shape-editor';
import BaseSvgElementWrapper from '../utils/svg/base-svg-element-wrapper';


class SvgOverlay extends BaseSvgElementWrapper {
    constructor(clientSize) {
        super('rect', clientSize, 'new-shape-overlay');

        this.set('width', '100%');
        this.set('height', '100%');
    }
}

export default class BaseNewShapeEditor extends BaseShapeEditor {
    get overlay() { return this._overlay; }

    render(canvas) {
        super.render(canvas);

        this.append(this._overlay = new SvgOverlay(this.canvasSize));
    }

}