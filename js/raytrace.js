function ray_color(ray, vertex) {
    let I = {
        flag: false,
        t: Number.MAX_VALUE,
    };
    let count = 0;
    for (let c = 0; c < 896; c++) {
        const t = getTriangle(c, vertex);
        const intersect = hitTriangle(t.v0, t.v1, t.v2, t.n0, t.n1, t.n2, ray);
        if (intersect.flag) {
            if(I.t>intersect.t)
            {
                I=intersect;
                count = c;
            }
        }
    }
    
    if(I.flag)
    {
        
        const normal = barycentricCoordinates(vertex,I,count);
        const col = phong_shading(I.p,[1,0.5,1],ray.orig,count,normal)
        return col
    }
    return [0.2,0.2,0.2];
}

function getTriangle(c, vertex) {
    const index = c * 18;
    
    return {
        v0: [vertex[index], vertex[index + 1], vertex[index + 2]],
        n0: [vertex[index + 3], vertex[index + 4], vertex[index + 5]],
        v1: [vertex[index + 6], vertex[index + 7], vertex[index + 8]],
        n1: [vertex[index + 9], vertex[index + 10], vertex[index + 11]],
        v2: [vertex[index + 12], vertex[index + 13], vertex[index+14]],
        n2: [vertex[index + 15], vertex[index+16], vertex[index + 17]],
    };
}


function barycentricCoordinates(vertex, I,c)
{
    const t = getTriangle(c,vertex);
    
    return ([(t.n0[0]*I.ABG[0]+t.n1[0]*I.ABG[1]+t.n2[0]*I.ABG[2]),
        (t.n0[1]*I.ABG[0]+t.n1[1]*I.ABG[1]+t.n2[1]*I.ABG[2]),
        (t.n0[2]*I.ABG[0]+t.n1[2]*I.ABG[1]+t.n2[2]*I.ABG[2])]);
}
function hitTriangle(v0, v1, v2, n0, n1, n2, r) {
    
    const e1 = Subtract(v1, v0);
    const e2 = Subtract(v2, v0);
    const pvec = cross(r.dir, e2);
    const det = dot(e1, pvec);

    if (Math.abs(det) < 0.0001) {
        return {flag:false};
    }

    const invDet = 1.0 / det;
    const tvec = Subtract(r.orig, v0);
    const u = dot(tvec, pvec) * invDet;

    if (u < 0.0 || u > 1.0) {
        return {flag:false};
    }

    const qvec = cross(tvec, e1);
    const v = dot(r.dir, qvec) * invDet;

    if (v < 0.0 || u + v > 1.0) {
        return {flag:false};
    }

    const t = dot(e2, qvec) * invDet;

    if(t > 0.000000000001)
    {
        const point = Add(r.orig, ScalarMultiply(r.dir,t));
        const abg = triPoint(v0,v1,v2,point);
        return {flag :true,p:point,ABG:abg,t:t};
    }
    else{
        return {flag:false};
    }
}
function area(v0, v1, v2) {
    const e1 = Subtract(v1, v0);
    const e2 = Subtract(v2, v0);
    const crossProduct = cross(e1, e2);
    
    return Math.sqrt(dot(crossProduct, crossProduct));
}

function triPoint(v0, v1, v2, p) {
    const ABC = area(v0, v1, v2);
    const PBC = area(p, v1, v2);
    const APC = area(v0, p, v2);
    const ABP = area(v0, v1, p);

    const abg = [PBC / ABC, APC / ABC, ABP / ABC];
    
    return abg;
}
function getRay(i, j,eye, width, height) {
    const rad = (60.0 * Math.PI)/180;
    const y = 1-(2*((j+ 0.5) / height));
    const x = (2*((i+ 0.5) / width))-1;
    const dir = Normalize([
        x * (width / height) * Math.tan(rad / 2),
       y * Math.tan( rad/ 2),
        -1
    ]);
    return { orig: eye, dir: dir };
}

function Add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function Subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function ScalarMultiply(v, scalar) {
    return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

function Normalize(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
}

function Negate(v) {
    return [-v[0], -v[1], -v[2]];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function phong_shading(point,light,origin,c,N){
    
            
            //get values from sliders
            var shineVal = parseFloat(
                document.getElementById("shineSlider").value
            );
            var shineOutput = document.getElementById("shineValue");
            shineOutput.innerHTML = shineVal;

            var KaVal = parseFloat(document.getElementById("KaSlider").value);
            var KaOutput = document.getElementById("KaValue");
            KaOutput.innerHTML = KaVal;

            var KdVal = parseFloat(document.getElementById("KdSlider").value);
            var KdOutput = document.getElementById("KdValue");
            KdOutput.innerHTML = KdVal;

            var KsVal = parseFloat(document.getElementById("KsSlider").value);
            var KsOutput = document.getElementById("KsValue");
            KsOutput.innerHTML = KsVal;

    const L = Normalize(Subtract(light, point));
   
    const E = Subtract(origin,point);
    let ka = KaVal;
    let kd=KdVal;
    let ks=KsVal;
    let n =shineVal;
    const d = Math.min(Math.max(dot(N, L), 0), 1);
    //const R = Normalize(Subtract(ScalarMultiply(N, 2 * dot(N, L)), L));
    const H = Normalize(Add(L,E));
    const s = Math.min(Math.max(Math.pow(dot(N,H), n), 0), 1);
    const la =[0.2,0.2,0.2];
    const le =[0.6,0.3,0.6];
    const A = ScalarMultiply(la,ka);
    const D = ScalarMultiply(le,d*kd);
    const S = ScalarMultiply(le,s*ks);

    const col =Add(A,Add(D,S));
    
    return col;
}

function ray_trace(vertex,canvas) {
    const image = [];
    
    const eye = [0,0.25,2];
    for (let i = 0; i < 256; i++) {
        for (let j = 0; j < 256; j++) {
           const ray = getRay(i, j,eye, 256, 256);
            const col =ray_color(ray, vertex);
            
                canvas.fillStyle = `rgb(${255*col[0]},${
                    255*col[1]}, ${255*col[2]})`;    
            canvas.fillRect(i, j, 256, 256);
        }
    }
    return image;
}
export { ray_trace};
