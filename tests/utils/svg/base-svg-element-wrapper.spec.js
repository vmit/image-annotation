import Provider from '../../../src/utils/provider';
import BaseSvgElementWrapper from '../../../src/utils/svg/base-svg-element-wrapper';


describe('BaseSvgElementWrapper', () => {
    let elementWrapper;
    let canvasSizeProvider;

    beforeEach(() => {
        canvasSizeProvider = new Provider(() => { return { width: 200, height: 100 }; });
    });

    it('should create appropriate SVG element', () => {
        elementWrapper = new BaseSvgElementWrapper('rect', canvasSizeProvider);

        expect(elementWrapper.el instanceof SVGRectElement).toBeTruthy();
        expect(elementWrapper.el.classList).toContain('ia-element');
        expect(elementWrapper.el.classList).toContain('ia-element-rect');
    });

    it('should get/set SVG element attributes', () => {
        elementWrapper = new BaseSvgElementWrapper('rect', canvasSizeProvider);

        elementWrapper.set('prop1', 'value1');
        elementWrapper.set('prop2', 1000);
        elementWrapper.set('prop3', null);
        elementWrapper.set('prop4', undefined);

        expect(elementWrapper.el.getAttribute('prop1')).toBe(elementWrapper.get('prop1'));
        expect(elementWrapper.get('prop1')).toBe('value1');
        expect(elementWrapper.get('prop2')).toBe('1000');
        expect(elementWrapper.get('prop3')).toBe(null);
        expect(elementWrapper.get('prop4')).toBe(null);
    });

    it('should get/set SVG element attributes', () => {
        elementWrapper = new BaseSvgElementWrapper('rect', canvasSizeProvider);

        elementWrapper.addClass('custom-test-class');
        expect(elementWrapper.el.classList).toContain('custom-test-class');

        elementWrapper.removeClass('custom-test-class');
        expect(elementWrapper.el.classList).not.toContain('custom-test-class');
    });

    it('should correctly convert normalized values into canvas coordinates', () => {
        elementWrapper = new BaseSvgElementWrapper('rect', canvasSizeProvider);

        expect(elementWrapper.toPxX(0)).toBe(0);
        expect(elementWrapper.toPxY(1)).toBe(100);

        expect(elementWrapper.toPxX(0.7)).toBe(140);
        expect(elementWrapper.toPxY(0.7)).toBe(70);

        expect(elementWrapper.toPxX( 1.5)).toBe( 300);
        expect(elementWrapper.toPxY(-0.5)).toBe(-50);

    });

});