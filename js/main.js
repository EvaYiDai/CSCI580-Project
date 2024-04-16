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
        const vertex = [];
        for (let i = 0; i < data.data.length; ++i) {
            vertex.push(...data.data[i].v0.v);
            vertex.push(...data.data[i].v0.n);
            vertex.push(...data.data[i].v1.v);
            vertex.push(...data.data[i].v1.n);
            vertex.push(...data.data[i].v2.v);
            vertex.push(...data.data[i].v2.n);
        }

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
           
            const image = ray_trace(viewMat,vertex, canvas);         
        
    } catch (error) {
        console.error("Error initializing WebGL:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
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
});

// Function to reload the page
function reloadPage() {
    window.location.reload();
}
document.getElementById("reloadButton").addEventListener("click", reloadPage);
