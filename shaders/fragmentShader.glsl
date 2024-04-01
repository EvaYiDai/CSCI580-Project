#version 300 es
precision mediump float;
in vec3 vNormal;
in float fragDepth;
out vec4 o;
void main() {
	vec3 lightDir = vec3(-0.707, -0.5, -0.5);
    float dotp = dot(lightDir, vNormal);

    if (dotp < 0.0) {
        dotp = -dotp;
    } 

    vec3 baseColor = vec3(0.95, 0.65, 0.88);
    vec3 scaledColor = dotp * baseColor;

    o = vec4(scaledColor, 1.0); 
		// gl_FragDepth = fragDepth;
}