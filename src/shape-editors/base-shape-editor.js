import EventEmitter from 'events';


export default class BaseShapeEditor extends EventEmitter {
    get shape() { return this._shape; }
    get canvas() { return this._canvas; }
    get style() { return this._style; }

    constructor(canvas, shape, style) {
        super();

        this._canvas = canvas;
        this._shape = shape;
        this._style = style;
    }

    /**
     * @param {BaseSvgElementWrapper} element
     */
    append(element) {
        this.canvas.appendChild(element.el);
    }

    onCanvasClick(x, y) {}
    onCanvasMouseMove(x, y) {}
    onCanvasKeyPressed(key) {}
    destroy() {}
}