/**
 * Data - END:44836
 */
async function loadData(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
    }
    return await response.json();
}

/**
 * Shaders
 */
//vertex shader

async function fetchShader(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader: ${url}`);
    }
    const shaderSource = await response.text();
    return shaderSource;
}

function compileShader(gl, sourceCode, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(shader);
        console.error(
            `Failed to compile ${
                type === gl.VERTEX_SHADER ? "vertex" : "fragment"
            } shader: ${errorMessage}`
        );
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(
            `Failed to link program: ${gl.getProgramInfoLog(program)}`
        );
        return null;
    }

    return program;
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function viewMatrix(u, v, n, r) {
    return [
        u[0],
        u[1],
        u[2],
        -dot(u, r),
        v[0],
        v[1],
        v[2],
        -dot(v, r),
        n[0],
        n[1],
        n[2],
        -dot(n, r),
        0,
        0,
        0,
        1,
    ];
}

function perspectiveMatrix(near, far, right, left, top, bottom) {
    const P = [
        [(2 * near) / (right - left), 0, (right + left) / (right - left), 0],
        [0, (2 * near) / (top - bottom), (top + bottom) / (top - bottom), 0],
        [0, 0, -(far + near) / (far - near), (-2 * far * near) / (far - near)],
        [0, 0, -1, 0],
    ];
    return P;
}

// Example view and perspective matrices
const u = [1, 0, 0];
const v = [0, 1, 0];
const n = [0, 0, 1];
const r = [0, 0, 20];
const viewMat = viewMatrix(u, v, n, r);

const near = 44;
const far = 45;
const left = -10;
const right = 10;
const top1 = 10;
const bottom = 10;
const persMat = perspectiveMatrix(near, far, right, left, top1, bottom);

function flattenMatrix(matrix) {
    return matrix.reduce((acc, val) => acc.concat(val), []);
}

const flatViewMat = flattenMatrix(viewMat);
const flatPersMat = flattenMatrix(persMat);

async function initWebGL(gl) {
    try {
        const data = await loadData("data/teapot_hw3.json");
        //data processing
        let maxZ = -1;
        const vertex = [];
        for (let i = 0; i < data.data.length; ++i) {
            vertex.push(...data.data[i].v0.v);
            vertex.push(...data.data[i].v0.n);
            vertex.push(...data.data[i].v1.v);
            vertex.push(...data.data[i].v0.n);
            vertex.push(...data.data[i].v2.v);
            vertex.push(...data.data[i].v0.n);
            if (data.data[i].v0.v[2] > maxZ) maxZ = data.data[i].v0.v[2];
            if (data.data[i].v1.v[2] > maxZ) maxZ = data.data[i].v1.v[2];
            if (data.data[i].v2.v[2] > maxZ) maxZ = data.data[i].v2.v[2];
        }

        // console.log(vertex);
        for (let i = 2; i < vertex.length; i += 6) vertex[i] = vertex[i] / maxZ;

        const vertexShaderSource = await fetchShader(
            "shaders/vertexShader.glsl"
        );
        const fragmentShaderSource = await fetchShader(
            "shaders/fragmentShader.glsl"
        );

        const shaderProgram = createShaderProgram(
            gl,
            vertexShaderSource,
            fragmentShaderSource
        );

        if (shaderProgram) {
            gl.useProgram(shaderProgram);
            gl.clearColor(0.5, 0.45, 0.4, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(0, 0, 256, 256);
            gl.enable(gl.DEPTH_TEST);

            /**
             * Buffers
             */
            const preBuffer = new Float32Array(vertex);
            const vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, preBuffer, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            // Check if the framebuffer is complete
            if (
                gl.checkFramebufferStatus(gl.FRAMEBUFFER) !==
                gl.FRAMEBUFFER_COMPLETE
            ) {
                console.log("Framebuffer is not complete");
            }
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            /**
             * Shader Attributes
             */
            // Set these matrices as uniforms in your shader program
            const viewMatrixLocation = gl.getUniformLocation(
                shaderProgram,
                "viewMatrix"
            );
            const perspectiveMatrixLocation = gl.getUniformLocation(
                shaderProgram,
                "perspectiveMatrix"
            );
            if (viewMatrixLocation < 0)
                console.log(
                    "Failed to get uniform location for...vertexPosition"
                );
            if (perspectiveMatrixLocation < 0)
                console.log(
                    "Failed to get uniform location for...normalPosition"
                );
            gl.uniformMatrix4fv(viewMatrixLocation, false, flatViewMat);
            gl.uniformMatrix4fv(perspectiveMatrixLocation, false, flatPersMat);
            const vI = gl.getAttribLocation(shaderProgram, "vertexPosition");
            const nI = gl.getAttribLocation(shaderProgram, "normalPosition");
            if (vI < 0)
                console.log(
                    "Failed to get attribute location for...vertexPosition"
                );
            if (nI < 0)
                console.log(
                    "Failed to get attribute location for...normalPosition"
                );

            const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
            gl.enableVertexAttribArray(vI);
            gl.vertexAttribPointer(vI, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(nI);
            gl.vertexAttribPointer(
                nI,
                3,
                gl.FLOAT,
                false,
                stride,
                3 * Float32Array.BYTES_PER_ELEMENT
            );

            /**
             * Draw
             */
            gl.useProgram(shaderProgram);
            gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 6);
        }
    } catch (error) {
        console.error("Error initializing WebGL:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    /**
     * Canvas
     */
    //get canvas reference
    const canvas = document.getElementById("glcanvas");
    if (!canvas) {
        console.log(
            "Could not find HTML canvas element - check for typos, or loading JavaScript file too early"
        );
    }
    //get webGL2 reference
    const gl = canvas.getContext("webgl2");
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

    initWebGL(gl)
        .then(() => {
            console.log("WebGL initialization successful.");
        })
        .catch((error) => {
            console.error("Error during WebGL initialization:", error);
        });
});
