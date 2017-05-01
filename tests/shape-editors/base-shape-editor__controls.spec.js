import { noop } from 'node-noop';
import { ControlsBuilder, BackControlDescription, RemoveControlDescription } from '../../src/shape-editors/base-shape-editor__controls';


describe('ControlsBuilder' , () => {
    let back;
    let remove;
    let controlsBuilder;

    beforeEach(() => {
        back = new BackControlDescription(noop);
        remove = new RemoveControlDescription(noop);
        controlsBuilder = new ControlsBuilder([back, remove]);

    });

    it('should return empty array if no controls were enabled', () => {
        expect(controlsBuilder.build()).toEqual([]);
    });

    it('should return array with enabled controls only', () => {
        expect(controlsBuilder
            .enable(remove.id)
            .build()
        ).toEqual([remove]);

        expect(controlsBuilder
            .enable(back.id)
            .build()
        ).toEqual([back, remove]);
    });


    it('should disable controls', () => {
        expect(controlsBuilder
            .enable(remove.id)
            .enable(back.id)
            .build()
        ).toEqual([back, remove]);

        expect(controlsBuilder
            .disable(remove.id)
            .build()
        ).toEqual([back]);

        expect(controlsBuilder
            .disable(back.id)
            .build()
        ).toEqual([]);
    });

});