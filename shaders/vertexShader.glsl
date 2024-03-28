#version 300 es
precision mediump float;
in vec3 vertexPosition;
in vec3 normalPosition;
uniform mat4 viewMatrix;
uniform mat4 perspectiveMatrix;
out vec3 vNormal;
out float fragDepth;
const float PI = 3.14159265359;
const float PIhalf = PI/2.;
void main() {
   vec4 pos4D = vec4(vertexPosition, 1.0);
   gl_Position = perspectiveMatrix * viewMatrix * pos4D;
   vNormal = normalPosition;
   fragDepth = gl_Position.z / gl_Position.w;
   // vec2 s = (vertexPosition.xy/128. - 1.) * mat2(cos(PIhalf), -sin(PIhalf), sin(PIhalf), cos(PIhalf));
   // vec3 pos = vec3(s, fragDepth);
	// gl_Position = vec4(pos, 1.);
}