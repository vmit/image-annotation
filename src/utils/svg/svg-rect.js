import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgRect extends BaseSvgElementWrapper {
    get p1() { return this._p1; }
    set p1(p1) {
        this._p1 = p1;
    }

    get p2() { return this._p2; }
    set p2(p2) {
        this._p2 = p2;
        if (this._p1 && this._p2) {
            const x = Math.min(this._p1.x, this._p2.x);
            const y = Math.min(this._p1.y, this._p2.y);
            const width = Math.abs(this._p2.x - this._p1.x);
            const height = Math.abs(this._p2.y - this._p1.y);

            this.set('x', this.toPxX(x));
            this.set('y', this.toPxY(y));
            this.set('width', this.toPxX(width));
            this.set('height', this.toPxY(height));
        }
    }

    /**
     * @param p1
     * @param p2
     * @param canvasSizeProvider
     * @param name
     */
    constructor(p1, p2, canvasSizeProvider, name) {
        super('rect', canvasSizeProvider, name);

        this._p1 = p1;
        this._p2 = p2;

        this.render();
    }

    render() {
        this.p1 = this._p1;
        this.p2 = this._p2;
    }

}