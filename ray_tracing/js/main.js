import {
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
} from "./util.js";
import {
    ray_trace,
} from "./raytrace.js";

async function loadData(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
    }
    return await response.json();
}


async function initWebGL(gl, from, to, left, right,canvas) {
    try {
        const data = await loadData("data/teapotHW5.json");
        
        //data processing
        var RxVal = parseFloat(document.getElementById("RxSlider").value);
        var RyVal = parseFloat(document.getElementById("RySlider").value);
        var RzVal = parseFloat(document.getElementById("RzSlider").value);
       
            const modelMat = mM(RxVal,RyVal,RzVal,1,1,1,0,0,0);

            const n = normalize(from.map((item, index) => item - to[index]));
            let u = normalize(cross([0, 1, 0], n));
            const v = cross(n, u);
            const r = from;
            const viewMat = vM(u, v, n, r);
            
            const near = 3;
            const far = 20;
            const bottom = -1;
            const top = 1;
            const perspectiveMat = pM(near, far, left, right, bottom, top);

            const vertex = [];
            
            for (let i = 0; i < data.data.length; ++i) {
                
                // Transform vertex 0
            let v0 = [data.data[i].v0.v[0],data.data[i].v0.v[1],data.data[i].v0.v[2],1];
            let n0 = [data.data[i].v0.n[0],data.data[i].v0.n[1],data.data[i].v0.n[2],0];
            
            let transformedV0 = multiplyMatrixVector(modelMat,v0);
            let transformedN0 = multiplyMatrixVector(modelMat,n0);
           
            transformedV0 = multiplyMatrixVector(viewMat,transformedV0);
            transformedN0 = multiplyMatrixVector(viewMat,transformedN0);

            transformedV0 = multiplyMatrixVector(perspectiveMat,transformedV0);
           
           

            // Transform vertex 1
            let v1 = [data.data[i].v1.v[0],data.data[i].v1.v[1],data.data[i].v1.v[2],1];
            let n1 = [data.data[i].v1.n[0],data.data[i].v1.n[1],data.data[i].v1.n[2],0];
            let transformedV1 = multiplyMatrixVector(modelMat,v1);
            let transformedN1 = multiplyMatrixVector(modelMat,n1);

            transformedV1 = multiplyMatrixVector(viewMat,transformedV1);
            transformedN1 = multiplyMatrixVector(viewMat,transformedN1);

            transformedV1 = multiplyMatrixVector(perspectiveMat,transformedV1);
            
            
            // Transform vertex 2
            let v2 = [data.data[i].v2.v[0],data.data[i].v2.v[1],data.data[i].v2.v[2],1];
            let n2 = [data.data[i].v2.n[0],data.data[i].v2.n[1],data.data[i].v2.n[2],0];
            let transformedV2 = multiplyMatrixVector(modelMat,v2);
            let transformedN2 = multiplyMatrixVector(modelMat,n2);

            transformedV2 = multiplyMatrixVector(viewMat,transformedV2);
            transformedN2 = multiplyMatrixVector(viewMat,transformedN2);

            transformedV2 = multiplyMatrixVector(perspectiveMat,transformedV2);
           
           
            vertex.push(transformedV0[0]/transformedV0[3],transformedV0[1]/transformedV0[3],transformedV0[2]/transformedV0[3]);
            vertex.push(transformedN0[0],transformedN0[1],transformedN0[2]);
            vertex.push(transformedV1[0]/transformedV1[3],transformedV1[1]/transformedV1[3],transformedV1[2]/transformedV1[3]);
            vertex.push(transformedN1[0],transformedN1[1],transformedN1[2]);
            vertex.push(transformedV2[0]/transformedV2[3],transformedV2[1]/transformedV2[3],transformedV2[2]/transformedV2[3]);
            vertex.push(transformedN2[0],transformedN2[1],transformedN2[2]);
            
            }
            const image = ray_trace(vertex, canvas); 
    } catch (error) {
        console.error("Error initializing WebGL:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    canvasLoad();
});
function canvasLoad(){
    /**
     * Canvas
     */
    //get canvas reference
    const canvas = document.getElementById("glcanvas_l");
    const canvasR = document.getElementById("glcanvas_r");
    if (!canvas) {
        console.log(
            "Could not find HTML canvas element - check for typos, or loading JavaScript file too early"
        );
    }
    if (!canvasR) {
        console.log(
            "Could not find HTML canvas element - check for typos, or loading JavaScript file too early"
        );
    }
    //get webGL2 reference
    const gl = canvas.getContext("2d");
    const glR = canvasR.getContext("2d");
    if (!gl) {
        const isWebGl1Supported = !!document
            .createElement("canvas")
            .getContext("webgl");
        if (isWebGl1Supported) {
            console.log(
                "WebGL 1 is supported, but not v2 - try using a different device or browser"
            );
        } else {
            console.log(
                "WebGL is not supported on this device - try using a different device or browser"
            );
        }
    }
    if (!glR) {
        const isWebGl1Supported = !!document
            .createElement("canvas")
            .getContext("webgl");
        if (isWebGl1Supported) {
            console.log(
                "WebGL 1 is supported, but not v2 - try using a different device or browser"
            );
        } else {
            console.log(
                "WebGL is not supported on this device - try using a different device or browser"
            );
        }
    }

    const left = -1;
    const right = 1;

    const fromL = [-1, 4, 15];
    const toL = [0, 0, 0];

    const fromR = [1, 4, 15];
    const toR = [0, 0, 0];

    // I only used L to calculate the offset, and then apply it to all L and R.
    // This is under the assumption that the two camera are symmetric to x = 0,
    // and also left and right is also symmetric to 0.
    const offset = calculateOffset(left, right, fromL, toL);
    const leftL = left + offset;
    const rightL = right + offset;
    const leftR = left - offset;
    const rightR = right - offset;

    initWebGL(gl, fromL, toL, leftL, rightL,gl)
        .then(() => {
            console.log("WebGL initialization successful.");
    
        })
        .catch((error) => {
            console.error("Error during WebGL initialization:", error);
        });
    initWebGL(glR, fromR, toR, leftR, rightR,glR)
        .then(() => {
            console.log("WebGL initialization successful.");
        })
        .catch((error) => {
            console.error("Error during WebGL initialization:", error);
        });
}
// Function to reload the page
function reloadPage() {
    window.location.reload();
}
// document.getElementById("reloadButton").addEventListener("click", reloadPage);
document.getElementById("rayTrace").addEventListener("click",() => {
    canvasLoad();
}); 
