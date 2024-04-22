const rotX = (x) => {
    const xRot = [
        [1, 0, 0, 0],
        [0, Math.cos(x), -Math.sin(x), 0],
        [0, Math.sin(x), Math.cos(x), 0],
        [0, 0, 0, 1],
    ];
    return xRot;
};
const rotY = (y) => {
    const yRot = [
        [Math.cos(y), 0, Math.sin(y), 0],
        [0, 1, 0, 0],
        [-Math.sin(y), 0, Math.cos(y), 0],
        [0, 0, 0, 1],
    ];
    return yRot;
};
const rotZ = (z) => {
    const zRot = [
        [Math.cos(z), -Math.sin(z), 0, 0],
        [Math.sin(z), Math.cos(z), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
    return zRot;
};
const tra = (x, y, z) => {
    return [
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1],
    ];
};
const sca = (x, y, z) => {
    return [
        [x, 0, 0, 0],
        [0, y, 0, 0],
        [0, 0, z, 0],
        [0, 0, 0, 1],
    ];
};
const transpose = (x) => {
    return [
        [x[0][0], x[1][0], x[2][0], x[3][0]],
        [x[0][1], x[1][1], x[2][1], x[3][1]],
        [x[0][2], x[1][2], x[2][2], x[3][2]],
        [x[0][3], x[1][3], x[2][3], x[3][3]],
    ];
};
const cross = (a, b) => {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
};
const normalize = (v) => {
    let mag = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / mag, v[1] / mag, v[2] / mag];
};
const dot = (a, b) => {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};
const det = (a, b, c, d) => {
    return a * d - b * c;
};
const clamp = (n, min, max) => {
    return Math.min(Math.max(n, min), max);
};
const t4 = (m1, m2) => {
    const t4result = [[], [], [], []];
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            t4result[i][j] =
                m1[i][0] * m2[0][j] +
                m1[i][1] * m2[1][j] +
                m1[i][2] * m2[2][j] +
                m1[i][3] * m2[3][j];
        }
    }
    return t4result;
};
const flattenMatrix = (matrix) => {
    return new Float32Array(matrix.reduce((acc, val) => acc.concat(val), []));
};
const mM = (rX, rY, rZ, sX, sY, sZ, tX, tY, tZ) => {
    let mM = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
    mM = t4(mM, rotX(rX));
    mM = t4(mM, rotY(rY));
    mM = t4(mM, rotZ(rZ));
    mM = t4(mM, sca(sX, sY, sZ));
    mM = t4(mM, tra(tX, tY, tZ));
    return mM;
};

const pM = (near, far, left, right, bottom, top) => {
    return [
        [(2 * near) / (right - left), 0, (right + left) / (right - left), 0],
        [0, (2 * near) / (top - bottom), (top + bottom) / (top - bottom), 0],
        [
            0,
            0,
            (-1 * (far + near)) / (far - near),
            (-2 * far * near) / (far - near),
        ],
        [0, 0, -1, 0],
    ];
};
const vM = (u, v, n, r) => {
    return [
        [u[0], u[1], u[2], -dot(u, r)],
        [v[0], v[1], v[2], -dot(v, r)],
        [n[0], n[1], n[2], -dot(n, r)],
        [0, 0, 0, 1],
    ];
};
const distance = (point1, point2) => {
    return Math.sqrt(
        Math.pow(point2[0] - point1[0], 2) +
            Math.pow(point2[1] - point1[1], 2) +
            Math.pow(point2[2] - point1[2], 2)
    );
};

const calculateOffset = (L, R, from, to) => {
    const LRdist = Math.abs(L - R) / 2;
    const cameraDist = distance(from, to);
    const adjustedL = Math.cos(Math.asin(LRdist / cameraDist));
    return Math.abs(adjustedL - Math.abs(L));
};
const multiplyMatrixVector=(matrix, vector)=> {
    let result = [];
    
    for (let i = 0; i < 4; i++) {
        result.push(0);
        for (let j = 0; j < 4; j++) {
            result[i] += matrix[i][j] * vector[j];
           
        }
    }
    return result;
}
export {
    transpose,
    cross,
    normalize,
    dot,
    det,
    clamp,
    t4,
    flattenMatrix,
    mM,
    pM,
    vM,
    calculateOffset,
    multiplyMatrixVector,
};
