import clamp from 'lodash/clamp';

function _round(value) {
    const accuracy = 100000;

    return clamp(Math.round(value * accuracy) / accuracy, 0, 100);
}

export function normalizeX(clientX, canvasPosition) {
    return _round((clientX - canvasPosition.left) / canvasPosition.width);
}

export function normalizeY(clientX, canvasPosition) {
    return _round((clientX - canvasPosition.top) / canvasPosition.height);
}

