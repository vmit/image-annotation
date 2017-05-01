/**
 * Controls description data object.
 */
export class ControlDescription {
    get id() { return this._id; }
    get title() { return this._title; }
    get action() { return this._action; }

    constructor(id, title, action) {
        this._id = id;
        this._title = title;
        this._action = action;
    }
}

/**
 * "back" control, titled with "↩"
 */
export class BackControlDescription extends ControlDescription {
    static get id() { return 'back'; }

    constructor(action) {
        super(BackControlDescription.id, '&#8617;', action)
    }
}

/**
 * "remove" control, titled with "×"
 */
export class RemoveControlDescription extends ControlDescription {
    static get id() { return 'remove'; }

    constructor(action) {
        super(RemoveControlDescription.id, '&#215;', action)
    }
}

/**
 * Controls list builder. It allows to specify list of control descriptions and enable only required ones.
 */
export class ControlsBuilder {
    /**
     * @param {Array<ControlDescription>} allControls
     */
    constructor(allControls) {
        this._allControls = allControls;
        this._enabled = {};
    }

    /**
     * Toggles particular control on.
     *
     * @param {string} controlId
     * @return {ControlsBuilder} - this
     */
    enable(controlId) {
        this._enabled[controlId] = true;
        return this;
    }

    /**
     * Toggles particular control off.
     *
     * @param {string} controlId
     * @return {ControlsBuilder} - this
     */
    disable(controlId) {
        this._enabled[controlId] = false;
        return this;
    }

    /**
     * @return {Array<ControlDescription>} - list of enabled controls
     */
    build() {
        return this._allControls.filter((controlDescription) => this._enabled[controlDescription.id]);
    }
}
