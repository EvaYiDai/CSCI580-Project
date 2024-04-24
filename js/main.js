import {
    rotX,
    rotY,
    rotZ,
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

async function loadData(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
    }
    return await response.json();
}

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

async function initWebGL(gl, from, to, left, right) {
    try {
        const data = await loadData("data/teapotHW5.json");
        //data processing
        const vertex = [];
        for (let i = 0; i < data.data.length; ++i) {
            vertex.push(...data.data[i].v0.v);
            vertex.push(...data.data[i].v0.n);
            vertex.push(...data.data[i].v0.t);
            vertex.push(...data.data[i].v1.v);
            vertex.push(...data.data[i].v1.n);
            vertex.push(...data.data[i].v1.t);
            vertex.push(...data.data[i].v2.v);
            vertex.push(...data.data[i].v2.n);
            vertex.push(...data.data[i].v2.t);
        }

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
            var RxVal = parseFloat(document.getElementById("RxSlider").value);
            var RxOutput = document.getElementById("RxValue");
            RxOutput.innerHTML = RxVal;

            var RyVal = parseFloat(document.getElementById("RySlider").value);
            var RyOutput = document.getElementById("RyValue");
            RyOutput.innerHTML = RyVal;

            var RzVal = parseFloat(document.getElementById("RzSlider").value);
            var RzOutput = document.getElementById("RzValue");
            RzOutput.innerHTML = RzVal;

            const modelMat = t4(t4(rotX(RxVal), rotY(RyVal)), rotZ(RzVal));

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

            const flatModelMat = flattenMatrix(modelMat);
            const flatViewMat = flattenMatrix(transpose(viewMat));
            const flatPerspectiveMat = flattenMatrix(transpose(perspectiveMat));

            const modelMatrixLocation = gl.getUniformLocation(
                shaderProgram,
                "modelMatrix"
            );
            const viewMatrixLocation = gl.getUniformLocation(
                shaderProgram,
                "viewMatrix"
            );
            const perspectiveMatrixLocation = gl.getUniformLocation(
                shaderProgram,
                "perspectiveMatrix"
            );
            if (modelMatrixLocation < 0)
                console.log(
                    "Failed to get uniform location for...modelPosition"
                );
            if (viewMatrixLocation < 0)
                console.log(
                    "Failed to get uniform location for...vertexPosition"
                );
            if (perspectiveMatrixLocation < 0)
                console.log(
                    "Failed to get uniform location for...normalPosition"
                );
            gl.uniformMatrix4fv(modelMatrixLocation, false, flatModelMat);
            gl.uniformMatrix4fv(viewMatrixLocation, false, flatViewMat);
            gl.uniformMatrix4fv(
                perspectiveMatrixLocation,
                false,
                flatPerspectiveMat
            );
            //Light/Material Uniforms
            const shineLocation = gl.getUniformLocation(shaderProgram, "shine");
            const KaLocation = gl.getUniformLocation(shaderProgram, "Ka");
            const KdLocation = gl.getUniformLocation(shaderProgram, "Kd");
            const KsLocation = gl.getUniformLocation(shaderProgram, "Ks");
            const nsLocation = gl.getUniformLocation(shaderProgram, "nScale");
            const nmLocation = gl.getUniformLocation(shaderProgram, "nMix");
            if (shineLocation < 0)
                console.log("Failed to get uniform location for...shine");
            if (KaLocation < 0)
                console.log("Failed to get uniform location for...Ka");
            if (KdLocation < 0)
                console.log("Failed to get uniform location for...Kd");
            if (KsLocation < 0)
                console.log("Failed to get uniform location for...Ks");
            if (nsLocation < 0)
                console.log("Failed to get uniform location for...nScale");
            if (nmLocation < 0)
                console.log("Failed to get uniform location for...nMix");
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

            var nsVal = parseFloat(document.getElementById("nsSlider").value);
            var nsOutput = document.getElementById("nsValue");
            nsOutput.innerHTML = nsVal;

            var nmVal = parseFloat(document.getElementById("nmSlider").value);
            var nmOutput = document.getElementById("nmValue");
            nmOutput.innerHTML = nmVal;

            gl.uniform1f(shineLocation, shineVal);
            gl.uniform1f(KaLocation, KaVal);
            gl.uniform1f(KdLocation, KdVal);
            gl.uniform1f(KsLocation, KsVal);
            gl.uniform1f(nsLocation, nsVal);
            gl.uniform1f(nmLocation, nmVal);

            const vI = gl.getAttribLocation(shaderProgram, "vertexPosition");
            const nI = gl.getAttribLocation(shaderProgram, "normalPosition");
            const tI = gl.getAttribLocation(shaderProgram, "uvPosition");
            if (vI < 0)
                console.log(
                    "Failed to get attribute location for...vertexPosition"
                );
            if (nI < 0)
                console.log(
                    "Failed to get attribute location for...normalPosition"
                );
            if (tI < 0)
                console.log(
                    "Failed to get attribute location for...uvPosition"
                );

            const stride = 8 * Float32Array.BYTES_PER_ELEMENT;
            gl.enableVertexAttribArray(vI);
            gl.vertexAttribPointer(vI, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(nI);
            gl.vertexAttribPointer(nI, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
            gl.enableVertexAttribArray(tI);
            gl.vertexAttribPointer(tI, 2, gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT);

            /**
             * Draw
             */
            gl.useProgram(shaderProgram);
            gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);

            document
                .getElementById("nsSlider")
                .addEventListener("input", function () {
                    var nsVal = parseFloat(this.value);
                    gl.uniform1f(nsLocation, nsVal);
                    nsOutput.innerHTML = nsVal;
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });

            document
                .getElementById("nmSlider")
                .addEventListener("input", function () {
                    var nmVal = parseFloat(this.value);
                    gl.uniform1f(nmLocation, nmVal);
                    nmOutput.innerHTML = nmVal;
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });

            document
                .getElementById("shineSlider")
                .addEventListener("input", function () {
                    var shineVal = parseFloat(this.value);
                    gl.uniform1f(shineLocation, shineVal);
                    shineOutput.innerHTML = shineVal;
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });

            document
                .getElementById("KaSlider")
                .addEventListener("input", function () {
                    var KaVal = parseFloat(this.value);
                    gl.uniform1f(KaLocation, KaVal);
                    KaOutput.innerHTML = KaVal;
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });

            document
                .getElementById("KdSlider")
                .addEventListener("input", function () {
                    var KdVal = parseFloat(this.value);
                    gl.uniform1f(KdLocation, KdVal);
                    KdOutput.innerHTML = KdVal;
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });

            document
                .getElementById("KsSlider")
                .addEventListener("input", function () {
                    var KsVal = parseFloat(this.value);
                    gl.uniform1f(KsLocation, KsVal);
                    KsOutput.innerHTML = KsVal;
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });

            document
                .getElementById("RxSlider")
                .addEventListener("input", function () {
                    var RxVal = parseFloat(this.value);
                    RxOutput.innerHTML = RxVal;
                    var RyVal = parseFloat(document.getElementById("RySlider").value);
                    var RzVal = parseFloat(document.getElementById("RzSlider").value);
                    const modelMat = t4(
                        t4(rotX(RxVal), rotY(RyVal)),
                        rotZ(RzVal)
                    );
                    const flatModelMat = flattenMatrix(modelMat);
                    gl.uniformMatrix4fv(
                        modelMatrixLocation,
                        false,
                        flatModelMat
                    );
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });

            document
                .getElementById("RySlider")
                .addEventListener("input", function () {
                    var RyVal = parseFloat(this.value);
                    RyOutput.innerHTML = RyVal;
                    var RxVal = parseFloat(document.getElementById("RxSlider").value);
                    var RzVal = parseFloat(document.getElementById("RzSlider").value);
                    const modelMat = t4(
                        t4(rotX(RxVal), rotY(RyVal)),
                        rotZ(RzVal)
                    );
                    const flatModelMat = flattenMatrix(modelMat);
                    gl.uniformMatrix4fv(
                        modelMatrixLocation,
                        false,
                        flatModelMat
                    );
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });

            document
                .getElementById("RzSlider")
                .addEventListener("input", function () {
                    var RzVal = parseFloat(this.value);
                    RzOutput.innerHTML = RzVal;
                    var RxVal = parseFloat(document.getElementById("RxSlider").value);
                    var RyVal = parseFloat(document.getElementById("RySlider").value);
                    const modelMat = t4(
                        t4(rotX(RxVal), rotY(RyVal)),
                        rotZ(RzVal)
                    );
                    const flatModelMat = flattenMatrix(modelMat);
                    gl.uniformMatrix4fv(
                        modelMatrixLocation,
                        false,
                        flatModelMat
                    );
                    gl.clearColor(0.5, 0.45, 0.4, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.useProgram(shaderProgram);
                    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 8);
                });
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
    const gl = canvas.getContext("webgl2");
    const glR = canvasR.getContext("webgl2");
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

    initWebGL(gl, fromL, toL, leftL, rightL)
        .then(() => {
            console.log("WebGL initialization successful.");
        })
        .catch((error) => {
            console.error("Error during WebGL initialization:", error);
        });
    initWebGL(glR, fromR, toR, leftR, rightR)
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
