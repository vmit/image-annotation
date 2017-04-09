function _round(value) {
    return Math.round(value * 1000) / 1000;
}

export function normalizeX(clientX, canvasPosition) {
    return _round((clientX - canvasPosition.left) / canvasPosition.width);
}

export function normalizeY(clientX, canvasPosition) {
    return _round((clientX - canvasPosition.top) / canvasPosition.height);
}

