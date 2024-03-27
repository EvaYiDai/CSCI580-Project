#version 300 es
precision mediump float;
in vec3 vertexPosition;
in vec3 normalPosition;
out vec3 vNormal;
out float fragDepth;
const float PI = 3.14159265359;
const float PIhalf = PI/2.;
void main() {
   vNormal = normalPosition;
   fragDepth = vertexPosition.z;
   vec2 s = (vertexPosition.xy/128. - 1.) * mat2(cos(PIhalf), -sin(PIhalf), sin(PIhalf), cos(PIhalf));
   vec3 pos = vec3(s, fragDepth);
	gl_Position = vec4(pos, 1.);
}