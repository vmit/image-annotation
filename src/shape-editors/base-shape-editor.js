import EventEmitter from 'events';
import SvgGroup from '../utils/svg/svg-g';


export default class BaseShapeEditor extends EventEmitter {
    get container() { return this._container; }
    get shape() { return this._shape; }

    constructor(shape, name) {
        super();

        this._container = new SvgGroup();
        this._shape = shape;
        this._canvas = null;

        this._container.set('class', `${this._container.get('class')} ia-shape ia-shape-${name || shape.type}`);
    }

    /**
     * @param {BaseSvgElementWrapper} element
     */
    append(element) {
        this.container.el.appendChild(element.el);
    }

    /**
     * @param {BaseSvgElementWrapper} element
     */
    remove(element) {
        this.container.el.removeChild(element.el);
    }

    appendToCanvas(canvas) {
        this._canvas = canvas;
        this._canvas.appendChild(this.container.el);
    }

    removeFromCanvas() {
        this._canvas.removeChild(this.container.el);
        this._canvas = null;
    }

    onCanvasClick(x, y) {}
    onCanvasMouseMove(x, y) {}
    onCanvasKeyPressed(key) {}
    onActivated() {}
    onDeactivated() {}

    render() {}
    destroy() {}
}