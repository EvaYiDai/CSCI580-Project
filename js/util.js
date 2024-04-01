const rotX = (x) => {
  const xRot = [
     [1, 0, 0, 0],
     [0, Math.cos(x), -Math.sin(x), 0],
     [0, Math.sin(x), Math.cos(x), 0],
     [0, 0, 0, 1]
  ];
  return xRot;
};
const rotY = (y) => {
  const yRot = [
     [Math.cos(y), 0, Math.sin(y), 0],
     [0, 1, 0, 0],
     [-Math.sin(y), 0, Math.cos(y), 0],
     [0, 0, 0, 1]
  ];
  return yRot;
};
const rotZ = (z) => {
  const zRot = [
     [Math.cos(z), -Math.sin(z), 0, 0],
     [Math.sin(z), Math.cos(z), 0, 0],
     [0, 0, 1, 0],
     [0, 0, 0, 1]
  ];
  return zRot;
};
const tra = (x, y, z) => {
  return [
     [1, 0, 0, x],
     [0, 1, 0, y],
     [0, 0, 1, z],
     [0, 0, 0, 1]
  ];
};
const sca = (x, y, z) => {
  return [
     [x, 0, 0, 0],
     [0, y, 0, 0],
     [0, 0, z, 0],
     [0, 0, 0, 1]
  ];
};
const transpose = (x) => {
  return [
    [x[0][0], x[0][1], x[0][2], x[0][3]],
    [x[1][0], x[1][1], x[1][2], x[1][3]],
    [x[2][0], x[2][1], x[2][2], x[2][3]],
    [x[3][0], x[3][1], x[3][2], x[3][3]]
  ]
};
const cross = (a, b) => {
  return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
};
const normalize = (v) => {
  let mag = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  return [v[0]/mag, v[1]/mag, v[2]/mag];
};
const dot = (a, b) => {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
};
const det = (a, b, c, d) => {
  return a * d - b * c;
};
const clamp = ( n, min, max ) => {
  return Math.min(Math.max( n, min ), max);
};
const t4 = (m1, m2) => {
   const t4result = [[],[],[],[]];
   for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
         t4result[i][j] = m1[i][0]*m2[0][j] + m1[i][1]*m2[1][j] + m1[i][2]*m2[2][j] + m1[i][3]*m2[3][j];
      }
   }
   return t4result;
};
const flattenMatrix = (matrix) => {
  return matrix.reduce((acc, val) => acc.concat(val), []);
};
const mM = (rX, rY, rZ, sX, sY, sZ, tX, tY, tZ) => {
  let result = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
  mM = t4(mM,rotX(rX));
  mM = t4(mM,rotY(rY));
  mM = t4(mM,rotZ(rZ));
  mM = t4(mM,sca(sX, sY, sZ));
  mM = t4(mM,tra(tX, tY, tZ));
  return mM;
};
const pM = (near, far, left, right, bottom, top) => {
  return [
    [ 2*near/(right-left), 0, (right+left)/(right-left), 0],
    [ 0, 2*near/(top-bottom), (top+bottom)/(top-bottom), 0],
    [ 0, 0, -1*(far+near)/(far-near), -2*far*near/(far-near)],
    [ 0, 0, -1, 0]
  ];
};
const vM = (u, v, n, r) => {
  return [
    [u.x, u.y, u.z, -dot(u, r) ],
    [v.x, v.y, v.z, -dot(v, r) ],
    [n.x, n.y, n.z, -dot(n, r) ],
    [0, 0, 0, 1]
  ];
};
export { transpose, cross, normalize, dot, det, clamp, t4, flattenMatrix, mM, pM, vM };