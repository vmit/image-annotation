import clone from 'clone';
import BaseSvgElementWrapper from './base-svg-element-wrapper';


export default class SvgPoint extends BaseSvgElementWrapper {
    set point(value) {
        this.set('cx', value.x);
        this.set('cy', value.y);
    }

    /**
     * @param point
     * @param style
     */
    constructor(point, style) {
        super('circle', SvgPoint.updateStyles(style));

        this.set('r', 1);

        this.point = point;
    }

    static updateStyles(styles) {
        styles = clone(styles);
        styles.strokeWidth = parseInt(styles.strokeWidth || 1) * 2;
        return styles;
    }
}