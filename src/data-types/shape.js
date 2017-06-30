/**
 * 2D coordinate.
 *
 * @typedef {Object} Point
 *
 * @param {number} x
 * @param {number} y
 */

/**
 * @typedef {Object} Shape
 *
 * @param {string} type - shape form, e.g. "polygon", "circle", "rectangle" etc
 * @param {*} data - depending on type description of the form, e.g. for "polygon" it is an {Array} of {Points}
 * @param {*} annotation - property for storing custom info (annotation) about the shape
 */